import { randomUUID } from 'node:crypto';
import { NotFoundError, ValidationError } from '../lib/errors.js';
import { Product, ProductVariant, Stock } from '../models/catalog.js';
import { EditorChoiceItem } from '../models/content.js';
import { SiteSetting } from '../models/reference.js';
import { syncProductInStock } from './admin-products.service.js';
import { invalidateCatalogAndHomeCache } from './cache-invalidation.service.js';
import { mapPublicSettings, type SiteConfigValue } from './settings.service.js';

/**
 * Admin UI sends PublicSettings shape (workingHours, socialLinks, mapCoordinates).
 * DB stores seed shape (hours, social, mapCenter). Normalize before merge.
 */
function toStoragePatch(input: Record<string, unknown>): SiteConfigValue {
  const patch: SiteConfigValue = {};

  if (typeof input.phone === 'string') patch.phone = input.phone;
  if (typeof input.address === 'string') patch.address = input.address;
  if (typeof input.metro === 'string') patch.metro = input.metro;
  if (typeof input.email === 'string') patch.email = input.email;
  if (typeof input.storeName === 'string') patch.storeName = input.storeName;

  if (typeof input.workingHours === 'string') patch.hours = input.workingHours;
  else if (typeof input.hours === 'string') patch.hours = input.hours;

  const socialIn = input.socialLinks ?? input.social;
  if (socialIn && typeof socialIn === 'object' && !Array.isArray(socialIn)) {
    const s = socialIn as Record<string, unknown>;
    patch.social = {
      ...(typeof s.telegram === 'string' ? { telegram: s.telegram } : {}),
      ...(typeof s.vk === 'string' ? { vk: s.vk } : {}),
      ...(typeof s.youtube === 'string' ? { youtube: s.youtube } : {}),
      ...(typeof s.telegramUsed === 'string' ? { telegramUsed: s.telegramUsed } : {}),
    };
  }

  if (input.mapCoordinates && typeof input.mapCoordinates === 'object' && !Array.isArray(input.mapCoordinates)) {
    const c = input.mapCoordinates as { lat?: unknown; lng?: unknown };
    const lat = typeof c.lat === 'number' ? c.lat : Number(c.lat);
    const lng = typeof c.lng === 'number' ? c.lng : Number(c.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      patch.mapCenter = [lat, lng];
    }
  } else if (Array.isArray(input.mapCenter) && input.mapCenter.length >= 2) {
    const lat = Number(input.mapCenter[0]);
    const lng = Number(input.mapCenter[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      patch.mapCenter = [lat, lng];
    }
  }

  if (input.delivery && typeof input.delivery === 'object') {
    patch.delivery = input.delivery as SiteConfigValue['delivery'];
  }
  if (input.payment && typeof input.payment === 'object') {
    patch.payment = input.payment as SiteConfigValue['payment'];
  }

  return patch;
}

export async function updateSiteSettings(value: Record<string, unknown>) {
  const row = await SiteSetting.findByPk('public');
  const current = (row?.value as SiteConfigValue | undefined) ?? {};
  const patch = toStoragePatch(value);

  const merged: SiteConfigValue = {
    ...current,
    ...patch,
    social: {
      ...(current.social ?? {}),
      ...(patch.social ?? {}),
    },
  };

  if (row) {
    // JSONB: Sequelize may skip update unless marked changed
    row.set('value', merged);
    row.changed('value', true);
    await row.save();
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
