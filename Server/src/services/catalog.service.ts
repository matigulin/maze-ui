import { createHash } from 'node:crypto';
import { Op, type WhereOptions } from 'sequelize';
import { z } from 'zod';
import { toNumber } from '../lib/decimal.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import { paginationOffset } from '../lib/pagination.js';
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
import { cache } from './cache.service.js';

const productListQuerySchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  memory: z.string().optional(),
  color: z.string().optional(),
  inStock: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  sort: z.enum(['price_asc', 'price_desc', 'newest']).optional(),
  search: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export interface CategoryChildDto {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  image: string | null;
}

export interface CategoryTreeItemDto {
  id: string;
  slug: string;
  name: string;
  isBrand: boolean;
  brandLogoUrl: string | null;
  icon: string | null;
  image: string | null;
  description: string | null;
  externalLink: string | null;
  children: CategoryChildDto[];
}

export interface ProductListItemDto {
  id: string;
  slug: string;
  title: string;
  brandName: string;
  brandSlug: string;
  subcategorySlug: string;
  priceFrom: number;
  oldPriceFrom: number | null;
  mainImageUrl: string | null;
  inStock: boolean;
  quantityAvailable: number;
  badges: string[];
}

export interface ProductVariantDto {
  id: string;
  sku: string;
  memory: string | null;
  color: string;
  colorHex: string;
  price: number;
  oldPrice: number | null;
  inStock: boolean;
  quantityAvailable: number;
}

export interface ProductDetailDto {
  id: string;
  slug: string;
  title: string;
  brandName: string;
  brandSlug: string;
  subcategorySlug: string;
  deviceType: string;
  description: string | null;
  images: string[];
  features: Array<{ title: string; description: string; icon: string | null }>;
  specifications: Record<string, Record<string, string>>;
  variants: ProductVariantDto[];
  badges: string[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
}

export function parseProductListQuery(query: Record<string, unknown>): ProductListQuery {
  const result = productListQuerySchema.safeParse(query);
  if (!result.success) {
    throw new ValidationError('Invalid catalog query parameters');
  }
  return result.data;
}

function buildFiltersHash(params: ProductListQuery): string {
  const payload = JSON.stringify(params);
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

function mapListItem(
  product: Product & {
    brand?: Category;
    subcategory?: Category;
    images?: ProductImage[];
    variants?: Array<ProductVariant & { stock?: Stock | null }>;
  },
): ProductListItemDto {
  const variants = product.variants ?? [];
  const prices = variants.map((v) => toNumber(v.price));
  const priceFrom = prices.length > 0 ? Math.min(...prices) : toNumber(product.base_price);
  const badges: string[] = [];
  if (product.badge_type) badges.push(product.badge_type);

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.url ??
    product.images?.[0]?.url ??
    null;

  const quantityAvailable = variants.reduce((sum, variant) => {
    if (!variant.is_available) return sum;
    const available =
      (variant.stock?.quantity ?? 0) - (variant.stock?.reserved_quantity ?? 0);
    return sum + Math.max(available, 0);
  }, 0);

  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    brandName: product.brand?.name ?? '',
    brandSlug: product.brand?.slug ?? '',
    subcategorySlug: product.subcategory?.slug ?? '',
    priceFrom,
    oldPriceFrom: product.old_price ? toNumber(product.old_price) : null,
    mainImageUrl: primaryImage,
    inStock: product.in_stock && quantityAvailable > 0,
    quantityAvailable,
    badges,
  };
}

async function loadCategoryTree(): Promise<CategoryTreeItemDto[]> {
  const rows = await Category.findAll({
    where: { is_active: true },
    order: [['sort_order', 'ASC']],
    attributes: [
      'id',
      'slug',
      'name',
      'parent_id',
      'is_brand',
      'brand_logo_url',
      'icon',
      'image',
      'description',
      'external_link',
    ],
  });

  const roots = rows.filter((row) => !row.parent_id);
  const childrenByParent = rows.reduce<Record<string, Category[]>>((acc, row) => {
    if (!row.parent_id) return acc;
    if (!acc[row.parent_id]) acc[row.parent_id] = [];
    acc[row.parent_id].push(row);
    return acc;
  }, {});

  return roots.map((root) => ({
    id: root.id,
    slug: root.slug,
    name: root.name,
    isBrand: root.is_brand,
    brandLogoUrl: root.brand_logo_url,
    icon: root.icon,
    image: root.image,
    description: root.description,
    externalLink: root.external_link,
    children: (childrenByParent[root.id] ?? []).map((child) => ({
      id: child.id,
      slug: child.slug,
      name: child.name,
      icon: child.icon,
      image: child.image,
    })),
  }));
}

export async function getCategoryTree(): Promise<CategoryTreeItemDto[]> {
  return cache.getOrSet('catalog:tree', 10 * 60, loadCategoryTree);
}

async function resolveCategoryIds(slug: string): Promise<string[]> {
  const categories = await Category.findAll({
    where: { slug, is_active: true },
    attributes: ['id'],
  });
  return categories.map((c) => c.id);
}

async function fetchProductList(params: ProductListQuery) {
  const where: WhereOptions<Product> = { is_published: true };
  const include: Parameters<typeof Product.findAndCountAll>[0]['include'] = [
    {
      model: Category,
      as: 'brand',
      attributes: ['id', 'slug', 'name'],
      required: false,
    },
    {
      model: Category,
      as: 'subcategory',
      attributes: ['id', 'slug', 'name'],
      required: false,
    },
    {
      model: ProductImage,
      as: 'images',
      attributes: ['url', 'is_primary', 'sort_order'],
      separate: true,
      order: [['sort_order', 'ASC']],
    },
    {
      model: ProductVariant,
      as: 'variants',
      attributes: ['id', 'price', 'memory', 'color_name', 'is_available'],
      required: false,
      include: [
        {
          model: Stock,
          as: 'stock',
          attributes: ['quantity', 'reserved_quantity'],
          required: false,
        },
      ],
    },
  ];

  if (params.brand) {
    const brandIds = await resolveCategoryIds(params.brand);
    if (brandIds.length === 0) {
      return { items: [], meta: { page: params.page, limit: params.limit, total: 0 } };
    }
    where.category_id = { [Op.in]: brandIds };
  }

  if (params.category) {
    const categoryIds = await resolveCategoryIds(params.category);
    if (categoryIds.length === 0) {
      return { items: [], meta: { page: params.page, limit: params.limit, total: 0 } };
    }
    Object.assign(where, {
      [Op.or]: [
        { category_id: { [Op.in]: categoryIds } },
        { subcategory_id: { [Op.in]: categoryIds } },
      ],
    });
  }

  if (params.inStock !== undefined) {
    where.in_stock = params.inStock;
  }

  if (params.search?.trim()) {
    where.name = { [Op.iLike]: `%${params.search.trim()}%` };
  }

  if (params.priceMin !== undefined || params.priceMax !== undefined) {
    const priceWhere: Record<string | symbol, number> = {};
    if (params.priceMin !== undefined) priceWhere[Op.gte] = params.priceMin;
    if (params.priceMax !== undefined) priceWhere[Op.lte] = params.priceMax;
    where.base_price = priceWhere;
  }

  const variantWhere: WhereOptions<ProductVariant> = {};
  if (params.memory) variantWhere.memory = params.memory;
  if (params.color) {
    variantWhere.color_name = { [Op.iLike]: `%${params.color}%` };
  }

  if (Object.keys(variantWhere).length > 0) {
    const variantInclude = include.find((item) => {
      const model = item as { as?: string };
      return model.as === 'variants';
    }) as {
      model: typeof ProductVariant;
      as: string;
      where?: WhereOptions<ProductVariant>;
      required?: boolean;
    };
    variantInclude.where = variantWhere;
    variantInclude.required = true;
  }

  let order: Array<[string, string]> = [['created_at', 'DESC']];
  if (params.sort === 'price_asc') order = [['base_price', 'ASC']];
  if (params.sort === 'price_desc') order = [['base_price', 'DESC']];
  if (params.sort === 'newest') order = [['created_at', 'DESC']];

  const offset = paginationOffset({ page: params.page, limit: params.limit });

  const { rows, count } = await Product.findAndCountAll({
    where,
    include,
    distinct: true,
    order,
    limit: params.limit,
    offset,
    subQuery: false,
  });

  return {
    items: rows.map((row) => mapListItem(row)),
    meta: { page: params.page, limit: params.limit, total: count },
  };
}

export async function listProducts(query: Record<string, unknown>) {
  const params = parseProductListQuery(query);
  const cacheKey = `catalog:products:${buildFiltersHash(params)}`;

  return cache.getOrSet(cacheKey, 2 * 60, () => fetchProductList(params));
}

async function loadProductBySlug(slug: string): Promise<ProductDetailDto> {
  const product = await Product.findOne({
    where: { slug, is_published: true },
    include: [
      { model: Category, as: 'brand', attributes: ['name', 'slug'] },
      { model: Category, as: 'subcategory', attributes: ['name', 'slug'] },
      {
        model: ProductImage,
        as: 'images',
        attributes: ['url', 'sort_order'],
        separate: true,
        order: [['sort_order', 'ASC']],
      },
      {
        model: ProductFeature,
        as: 'features',
        attributes: ['title', 'description', 'icon_url', 'sort_order'],
        separate: true,
        order: [['sort_order', 'ASC']],
      },
      {
        model: ProductVariant,
        as: 'variants',
        attributes: [
          'id',
          'sku',
          'memory',
          'color_name',
          'color_hex',
          'price',
          'is_available',
        ],
        separate: true,
        include: [
          {
            model: Stock,
            as: 'stock',
            attributes: ['quantity', 'reserved_quantity'],
            required: false,
          },
        ],
      },
      {
        model: ProductSpecValue,
        as: 'specValues',
        attributes: ['value'],
        include: [
          {
            model: SpecFieldDefinition,
            as: 'field',
            attributes: ['group_name', 'field_label', 'sort_order'],
          },
        ],
      },
    ],
  });

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  const specifications: Record<string, Record<string, string>> = {};
  for (const spec of product.specValues ?? []) {
    const field = spec.field;
    if (!field) continue;
    if (!specifications[field.group_name]) specifications[field.group_name] = {};
    specifications[field.group_name][field.field_label] = spec.value;
  }

  const badges: string[] = [];
  if (product.badge_type) badges.push(product.badge_type);

  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    brandName: product.brand?.name ?? '',
    brandSlug: product.brand?.slug ?? '',
    subcategorySlug: product.subcategory?.slug ?? '',
    deviceType: product.device_type,
    description: product.description,
    images: (product.images ?? []).map((img) => img.url),
    features: (product.features ?? []).map((f) => ({
      title: f.title,
      description: f.description,
      icon: f.icon_url,
    })),
    specifications,
    variants: (product.variants ?? []).map((variant) => {
      const available =
        (variant.stock?.quantity ?? 0) - (variant.stock?.reserved_quantity ?? 0);
      return {
        id: variant.id,
        sku: variant.sku,
        memory: variant.memory,
        color: variant.color_name,
        colorHex: variant.color_hex,
        price: toNumber(variant.price),
        oldPrice: product.old_price ? toNumber(product.old_price) : null,
        inStock: variant.is_available && available > 0,
        quantityAvailable: Math.max(available, 0),
      };
    }),
    badges,
    rating: toNumber(product.rating_avg),
    reviewsCount: product.reviews_count,
    inStock: product.in_stock,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetailDto> {
  return cache.getOrSet(`product:slug:${slug}`, 5 * 60, () => loadProductBySlug(slug));
}

export async function listProductSummariesByIds(productIds: string[]): Promise<ProductListItemDto[]> {
  if (productIds.length === 0) return [];

  const products = await Product.findAll({
    where: { id: { [Op.in]: productIds }, is_published: true },
    include: [
      { model: Category, as: 'brand', attributes: ['name', 'slug'] },
      { model: Category, as: 'subcategory', attributes: ['slug', 'name'] },
      {
        model: ProductImage,
        as: 'images',
        attributes: ['url', 'is_primary', 'sort_order'],
        separate: true,
        order: [['sort_order', 'ASC']],
      },
      {
        model: ProductVariant,
        as: 'variants',
        attributes: ['price', 'is_available'],
        separate: true,
        include: [
          {
            model: Stock,
            as: 'stock',
            attributes: ['quantity', 'reserved_quantity'],
            required: false,
          },
        ],
      },
    ],
  });

  const byId = new Map(products.map((p) => [p.id, p]));
  return productIds
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p))
    .map((p) => mapListItem(p));
}
