import { randomUUID } from 'node:crypto';
import { Op } from 'sequelize';
import { toNumber } from '../lib/decimal.js';
import { ConflictError, NotFoundError, ValidationError } from '../lib/errors.js';
import { isoTimestamp } from '../lib/model-attrs.js';
import { paginationOffset, parsePagination } from '../lib/pagination.js';
import {
  Category,
  Product,
  ProductFeature,
  ProductImage,
  ProductSpecValue,
  ProductVariant,
  SpecFieldDefinition,
  Stock,
} from '../models/catalog.js';
import { invalidateCatalogAndHomeCache } from './cache-invalidation.service.js';

function mapAdminProductSummary(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categoryId: product.category_id,
    subcategoryId: product.subcategory_id,
    deviceType: product.device_type,
    basePrice: toNumber(product.base_price),
    oldPrice: product.old_price ? toNumber(product.old_price) : null,
    badgeType: product.badge_type,
    badgeText: product.badge_text,
    isPublished: product.is_published,
    inStock: product.in_stock,
    ratingAvg: toNumber(product.rating_avg),
    reviewsCount: product.reviews_count,
    createdAt: isoTimestamp(product, 'createdAt'),
    updatedAt: isoTimestamp(product, 'updatedAt'),
  };
}

function mapAdminVariant(variant: ProductVariant & { stock?: Stock | null }) {
  const stock = variant.stock;
  const available = stock ? Math.max(0, stock.quantity - stock.reserved_quantity) : 0;

  return {
    id: variant.id,
    productId: variant.product_id,
    sku: variant.sku,
    colorName: variant.color_name,
    colorHex: variant.color_hex,
    memory: variant.memory,
    price: toNumber(variant.price),
    isAvailable: variant.is_available,
    quantity: stock?.quantity ?? 0,
    reservedQuantity: stock?.reserved_quantity ?? 0,
    quantityAvailable: available,
  };
}

async function assertUniqueProductSlug(slug: string, excludeId?: string) {
  const existing = await Product.findOne({
    where: {
      slug,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
    paranoid: false,
  });
  if (existing) {
    throw new ConflictError('DUPLICATE_RESOURCE', 'Product slug already exists');
  }
}

async function assertUniqueSku(sku: string, excludeId?: string) {
  const existing = await ProductVariant.findOne({
    where: {
      sku,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
    paranoid: false,
  });
  if (existing) {
    throw new ConflictError('DUPLICATE_RESOURCE', 'Variant SKU already exists');
  }
}

async function assertCategoryIds(categoryId: string, subcategoryId: string) {
  const [category, subcategory] = await Promise.all([
    Category.findByPk(categoryId),
    Category.findByPk(subcategoryId),
  ]);
  if (!category || !subcategory) {
    throw new NotFoundError('Category not found');
  }
}

export async function syncProductInStock(productId: string) {
  const variants = await ProductVariant.findAll({
    where: { product_id: productId },
    include: [{ model: Stock, as: 'stock', required: false }],
  });

  const inStock = variants.some((variant) => {
    if (!variant.is_available) return false;
    const stock = variant.stock;
    if (!stock) return false;
    return stock.quantity - stock.reserved_quantity > 0;
  });

  await Product.update({ in_stock: inStock }, { where: { id: productId } });
  return inStock;
}

export async function listAdminProducts(query: Record<string, unknown>) {
  const { page, limit } = parsePagination(query);
  const offset = paginationOffset({ page, limit });
  const where: Record<string, unknown> = {};

  const name =
    typeof query.name === 'string'
      ? query.name.trim()
      : typeof query.search === 'string'
        ? query.search.trim()
        : '';
  const slug = typeof query.slug === 'string' ? query.slug.trim() : '';

  if (name) {
    where.name = { [Op.iLike]: `%${name}%` };
  }
  if (slug) {
    where.slug = { [Op.iLike]: `%${slug}%` };
  }

  if (query.isPublished === 'true' || query.isPublished === true) {
    where.is_published = true;
  } else if (query.isPublished === 'false' || query.isPublished === false) {
    where.is_published = false;
  }

  if (query.inStock === 'true' || query.inStock === true) {
    where.in_stock = true;
  } else if (query.inStock === 'false' || query.inStock === false) {
    where.in_stock = false;
  }

  const { rows, count } = await Product.findAndCountAll({
    where,
    order: [['updated_at', 'DESC']],
    limit,
    offset,
  });

  return {
    items: rows.map(mapAdminProductSummary),
    meta: { page, limit, total: count },
  };
}

export async function getAdminProduct(id: string, includeDeleted = false) {
  const product = await Product.findByPk(id, {
    paranoid: !includeDeleted,
    include: [
      { model: ProductImage, as: 'images', separate: true, order: [['sort_order', 'ASC']] },
      { model: ProductFeature, as: 'features', separate: true, order: [['sort_order', 'ASC']] },
      {
        model: ProductVariant,
        as: 'variants',
        separate: true,
        include: [{ model: Stock, as: 'stock' }],
      },
      {
        model: ProductSpecValue,
        as: 'specValues',
        separate: true,
        include: [{ association: 'field' }],
      },
    ],
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  return {
    ...mapAdminProductSummary(product),
    description: product.description,
    images: (product.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      sortOrder: image.sort_order,
      isPrimary: image.is_primary,
    })),
    features: (product.features ?? []).map((feature) => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      iconUrl: feature.icon_url,
      sortOrder: feature.get('sort_order') as number,
    })),
    variants: (product.variants ?? []).map(mapAdminVariant),
    specifications: (product.specValues ?? []).map((spec) => ({
      fieldId: spec.field_id,
      fieldKey: spec.field?.field_key ?? null,
      fieldLabel: spec.field?.field_label ?? null,
      groupName: spec.field?.group_name ?? null,
      value: spec.value,
    })),
  };
}

export async function createAdminProduct(input: {
  slug: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  deviceType: string;
  description?: string | null;
  basePrice: number;
  oldPrice?: number | null;
  badgeType?: string | null;
  badgeText?: string | null;
  isPublished?: boolean;
}) {
  await assertUniqueProductSlug(input.slug);
  await assertCategoryIds(input.categoryId, input.subcategoryId);

  const product = await Product.create({
    id: randomUUID(),
    slug: input.slug,
    name: input.name,
    category_id: input.categoryId,
    subcategory_id: input.subcategoryId,
    device_type: input.deviceType,
    description: input.description ?? null,
    base_price: input.basePrice,
    old_price: input.oldPrice ?? null,
    badge_type: input.badgeType ?? null,
    badge_text: input.badgeText ?? null,
    is_published: input.isPublished ?? false,
    in_stock: false,
  });

  await invalidateCatalogAndHomeCache();
  return mapAdminProductSummary(product);
}

export async function updateAdminProduct(
  id: string,
  input: Partial<{
    slug: string;
    name: string;
    categoryId: string;
    subcategoryId: string;
    deviceType: string;
    description: string | null;
    basePrice: number;
    oldPrice: number | null;
    badgeType: string | null;
    badgeText: string | null;
    isPublished: boolean;
  }>,
) {
  const product = await Product.findByPk(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  if (input.slug && input.slug !== product.slug) {
    await assertUniqueProductSlug(input.slug, id);
  }

  if (input.categoryId && input.subcategoryId) {
    await assertCategoryIds(input.categoryId, input.subcategoryId);
  }

  await product.update({
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.categoryId !== undefined ? { category_id: input.categoryId } : {}),
    ...(input.subcategoryId !== undefined ? { subcategory_id: input.subcategoryId } : {}),
    ...(input.deviceType !== undefined ? { device_type: input.deviceType } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.basePrice !== undefined ? { base_price: input.basePrice } : {}),
    ...(input.oldPrice !== undefined ? { old_price: input.oldPrice } : {}),
    ...(input.badgeType !== undefined ? { badge_type: input.badgeType } : {}),
    ...(input.badgeText !== undefined ? { badge_text: input.badgeText } : {}),
    ...(input.isPublished !== undefined ? { is_published: input.isPublished } : {}),
  });

  await invalidateCatalogAndHomeCache();
  return mapAdminProductSummary(product);
}

export async function deleteAdminProduct(id: string) {
  const product = await Product.findByPk(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  await product.destroy();
  await invalidateCatalogAndHomeCache();
}

export async function restoreAdminProduct(id: string) {
  const product = await Product.findByPk(id, { paranoid: false });
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  await product.restore();
  await invalidateCatalogAndHomeCache();
  return mapAdminProductSummary(product);
}

export async function listAdminVariants(productId: string) {
  const product = await Product.findByPk(productId, { attributes: ['id'] });
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  const variants = await ProductVariant.findAll({
    where: { product_id: productId },
    include: [{ model: Stock, as: 'stock' }],
    order: [['created_at', 'ASC']],
  });

  return variants.map(mapAdminVariant);
}

export async function createAdminVariant(
  productId: string,
  input: {
    sku: string;
    colorName: string;
    colorHex: string;
    memory?: string | null;
    price: number;
    isAvailable?: boolean;
    quantity?: number;
  },
) {
  const product = await Product.findByPk(productId, { attributes: ['id'] });
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  await assertUniqueSku(input.sku);

  const variant = await ProductVariant.create({
    id: randomUUID(),
    product_id: productId,
    sku: input.sku,
    color_name: input.colorName,
    color_hex: input.colorHex,
    memory: input.memory ?? null,
    price: input.price,
    is_available: input.isAvailable ?? true,
  });

  await Stock.create({
    variant_id: variant.id,
    quantity: input.quantity ?? 0,
    reserved_quantity: 0,
  });

  await syncProductInStock(productId);
  await invalidateCatalogAndHomeCache();

  const withStock = await ProductVariant.findByPk(variant.id, {
    include: [{ model: Stock, as: 'stock' }],
  });

  return mapAdminVariant(withStock!);
}

export async function updateAdminVariant(
  productId: string,
  variantId: string,
  input: Partial<{
    sku: string;
    colorName: string;
    colorHex: string;
    memory: string | null;
    price: number;
    isAvailable: boolean;
    quantity: number;
  }>,
) {
  const variant = await ProductVariant.findOne({
    where: { id: variantId, product_id: productId },
    include: [{ model: Stock, as: 'stock' }],
  });

  if (!variant) {
    throw new NotFoundError('Variant not found');
  }

  if (input.sku && input.sku !== variant.sku) {
    await assertUniqueSku(input.sku, variantId);
  }

  await variant.update({
    ...(input.sku !== undefined ? { sku: input.sku } : {}),
    ...(input.colorName !== undefined ? { color_name: input.colorName } : {}),
    ...(input.colorHex !== undefined ? { color_hex: input.colorHex } : {}),
    ...(input.memory !== undefined ? { memory: input.memory } : {}),
    ...(input.price !== undefined ? { price: input.price } : {}),
    ...(input.isAvailable !== undefined ? { is_available: input.isAvailable } : {}),
  });

  if (input.quantity !== undefined) {
    if (variant.stock) {
      await variant.stock.update({ quantity: input.quantity });
    } else {
      await Stock.create({
        variant_id: variant.id,
        quantity: input.quantity,
        reserved_quantity: 0,
      });
    }
  }

  await syncProductInStock(productId);
  await invalidateCatalogAndHomeCache();

  const refreshed = await ProductVariant.findByPk(variantId, {
    include: [{ model: Stock, as: 'stock' }],
  });

  return mapAdminVariant(refreshed!);
}

export async function deleteAdminVariant(productId: string, variantId: string) {
  const variant = await ProductVariant.findOne({
    where: { id: variantId, product_id: productId },
  });
  if (!variant) {
    throw new NotFoundError('Variant not found');
  }
  await variant.destroy();
  await syncProductInStock(productId);
  await invalidateCatalogAndHomeCache();
}

export async function restoreAdminVariant(productId: string, variantId: string) {
  const variant = await ProductVariant.findOne({
    where: { id: variantId, product_id: productId },
    paranoid: false,
  });
  if (!variant) {
    throw new NotFoundError('Variant not found');
  }
  await variant.restore();
  await syncProductInStock(productId);
  await invalidateCatalogAndHomeCache();

  const refreshed = await ProductVariant.findByPk(variantId, {
    include: [{ model: Stock, as: 'stock' }],
  });

  return mapAdminVariant(refreshed!);
}

export async function createAdminProductImage(
  productId: string,
  input: { url: string; sortOrder?: number; isPrimary?: boolean },
) {
  const product = await Product.findByPk(productId, { attributes: ['id'] });
  if (!product) throw new NotFoundError('Product not found');

  if (input.isPrimary) {
    await ProductImage.update({ is_primary: false }, { where: { product_id: productId } });
  }

  const image = await ProductImage.create({
    id: randomUUID(),
    product_id: productId,
    url: input.url,
    sort_order: input.sortOrder ?? 0,
    is_primary: input.isPrimary ?? false,
  });

  await invalidateCatalogAndHomeCache();
  return {
    id: image.id,
    url: image.url,
    sortOrder: image.sort_order,
    isPrimary: image.is_primary,
  };
}

export async function updateAdminProductImage(
  productId: string,
  imageId: string,
  input: { url?: string; sortOrder?: number; isPrimary?: boolean },
) {
  const image = await ProductImage.findOne({ where: { id: imageId, product_id: productId } });
  if (!image) throw new NotFoundError('Image not found');

  if (input.isPrimary) {
    await ProductImage.update({ is_primary: false }, { where: { product_id: productId } });
  }

  await image.update({
    ...(input.url !== undefined ? { url: input.url } : {}),
    ...(input.sortOrder !== undefined ? { sort_order: input.sortOrder } : {}),
    ...(input.isPrimary !== undefined ? { is_primary: input.isPrimary } : {}),
  });

  await invalidateCatalogAndHomeCache();
  return {
    id: image.id,
    url: image.url,
    sortOrder: image.sort_order,
    isPrimary: image.is_primary,
  };
}

export async function deleteAdminProductImage(productId: string, imageId: string) {
  const image = await ProductImage.findOne({ where: { id: imageId, product_id: productId } });
  if (!image) throw new NotFoundError('Image not found');
  await image.destroy();
  await invalidateCatalogAndHomeCache();
}

export async function createAdminProductFeature(
  productId: string,
  input: { title: string; description: string; iconUrl?: string | null; sortOrder?: number },
) {
  const product = await Product.findByPk(productId, { attributes: ['id'] });
  if (!product) throw new NotFoundError('Product not found');

  const feature = await ProductFeature.create({
    id: randomUUID(),
    product_id: productId,
    title: input.title,
    description: input.description,
    icon_url: input.iconUrl ?? null,
    sort_order: input.sortOrder ?? 0,
  });

  await invalidateCatalogAndHomeCache();
  return {
    id: feature.id,
    title: feature.title,
    description: feature.description,
    iconUrl: feature.icon_url,
    sortOrder: feature.get('sort_order') as number,
  };
}

export async function updateAdminProductFeature(
  productId: string,
  featureId: string,
  input: Partial<{
    title: string;
    description: string;
    iconUrl: string | null;
    sortOrder: number;
  }>,
) {
  const feature = await ProductFeature.findOne({
    where: { id: featureId, product_id: productId },
  });
  if (!feature) throw new NotFoundError('Feature not found');

  await feature.update({
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.iconUrl !== undefined ? { icon_url: input.iconUrl } : {}),
    ...(input.sortOrder !== undefined ? { sort_order: input.sortOrder } : {}),
  });

  await invalidateCatalogAndHomeCache();
  return {
    id: feature.id,
    title: feature.title,
    description: feature.description,
    iconUrl: feature.icon_url,
    sortOrder: feature.get('sort_order') as number,
  };
}

export async function deleteAdminProductFeature(productId: string, featureId: string) {
  const feature = await ProductFeature.findOne({
    where: { id: featureId, product_id: productId },
  });
  if (!feature) throw new NotFoundError('Feature not found');
  await feature.destroy();
  await invalidateCatalogAndHomeCache();
}

export async function listAdminSpecFields(deviceType: string) {
  const rows = await SpecFieldDefinition.findAll({
    where: { device_type: deviceType },
    order: [
      ['group_name', 'ASC'],
      ['sort_order', 'ASC'],
    ],
  });
  return rows.map((row) => ({
    id: row.id,
    deviceType: row.device_type,
    groupName: row.group_name,
    fieldKey: row.field_key,
    fieldLabel: row.field_label,
    sortOrder: row.get('sort_order') as number,
  }));
}

export async function upsertAdminProductSpecs(
  productId: string,
  values: Array<{ fieldId: string; value: string }>,
) {
  const product = await Product.findByPk(productId, { attributes: ['id', 'device_type'] });
  if (!product) throw new NotFoundError('Product not found');

  for (const entry of values) {
    const field = await SpecFieldDefinition.findByPk(entry.fieldId);
    if (!field || field.device_type !== product.device_type) {
      throw new ValidationError('Invalid spec field for product device type');
    }

    const existing = await ProductSpecValue.findOne({
      where: { product_id: productId, field_id: entry.fieldId },
    });

    if (entry.value.trim()) {
      if (existing) {
        await existing.update({ value: entry.value.trim() });
      } else {
        await ProductSpecValue.create({
          product_id: productId,
          field_id: entry.fieldId,
          value: entry.value.trim(),
        });
      }
    } else if (existing) {
      await existing.destroy();
    }
  }

  await invalidateCatalogAndHomeCache();
  return getAdminProduct(productId);
}
