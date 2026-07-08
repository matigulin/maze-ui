import { randomUUID } from 'node:crypto';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import { Product, ProductVariant, Stock } from '../models/catalog.js';
import { EditorChoiceItem } from '../models/content.js';
import { SiteSetting } from '../models/reference.js';
import { syncProductInStock } from './admin-products.service.js';
import { invalidateCatalogAndHomeCache } from './cache-invalidation.service.js';
import { mapPublicSettings } from './settings.service.js';

export async function updateSiteSettings(value: Record<string, unknown>) {
  const row = await SiteSetting.findByPk('public');
  const current = (row?.value as Record<string, unknown> | undefined) ?? {};
  const merged = { ...current, ...value };

  if (row) {
    await row.update({ value: merged });
  } else {
    await SiteSetting.create({ key: 'public', value: merged });
  }

  await invalidateCatalogAndHomeCache();
  return mapPublicSettings(merged);
}

export async function setEditorChoice(productIds: string[]) {
  if (productIds.length < 8 || productIds.length > 12) {
    throw new ValidationError('Editor choice must contain 8 to 12 products');
  }

  const products = await Product.findAll({
    where: { id: productIds, is_published: true },
    attributes: ['id'],
  });

  if (products.length !== productIds.length) {
    throw new NotFoundError('One or more products not found');
  }

  await EditorChoiceItem.destroy({ where: {} });
  await EditorChoiceItem.bulkCreate(
    productIds.map((productId, index) => ({
      id: randomUUID(),
      product_id: productId,
      sort_order: index,
    })),
  );

  await invalidateCatalogAndHomeCache();
  return { productIds };
}

export async function updateProductStock(productId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new ValidationError('quantity must be a non-negative integer');
  }

  const product = await Product.findByPk(productId, { attributes: ['id'] });
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  const variants = await ProductVariant.findAll({
    where: { product_id: productId },
    attributes: ['id'],
  });

  if (variants.length === 0) {
    throw new NotFoundError('Product has no variants');
  }

  const variantIds = variants.map((variant) => variant.id);
  await Stock.update({ quantity }, { where: { variant_id: variantIds } });
  await syncProductInStock(productId);
  await invalidateCatalogAndHomeCache();

  return { productId, quantity, variantCount: variantIds.length };
}
