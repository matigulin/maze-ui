import { createHash } from 'node:crypto';
import type { DeliveryProviderType } from './constants.js';

export interface QuoteAddress {
  street?: string;
  house?: string;
  flat?: string;
  postalCode?: string;
}

export interface QuoteItem {
  variantId: string;
  quantity: number;
}

export interface QuoteRequestInput {
  provider: DeliveryProviderType;
  city: string;
  address?: QuoteAddress;
  items: QuoteItem[];
}

export interface DeliveryRateRow {
  delivery_type: string;
  city_scope: string;
  base_price: number;
  fee_percent: number;
}

export interface SiteDeliverySettings {
  spbFrom?: number;
  spbFreeFrom?: number;
  russiaFrom?: number;
}

const SPB_CITY_PATTERN = /санкт-петербург|спб|saint petersburg|st\.?\s*petersburg/i;

export function resolveCityScope(city: string): 'spb' | 'rf' {
  return SPB_CITY_PATTERN.test(city.trim()) ? 'spb' : 'rf';
}

export function buildQuoteRequestHash(input: QuoteRequestInput, ownerKeyValue: string): string {
  const normalized = {
    ownerKey: ownerKeyValue,
    provider: input.provider,
    city: input.city.trim().toLowerCase(),
    address: {
      street: input.address?.street?.trim().toLowerCase() ?? '',
      house: input.address?.house?.trim().toLowerCase() ?? '',
      flat: input.address?.flat?.trim().toLowerCase() ?? '',
      postalCode: input.address?.postalCode?.trim() ?? '',
    },
    items: [...input.items]
      .map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      .sort((a, b) => a.variantId.localeCompare(b.variantId)),
  };

  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex').slice(0, 32);
}

export function estimateEtaDays(provider: DeliveryProviderType): number {
  switch (provider) {
    case 'pickup':
    case 'spb_courier':
    case 'spb_yandex':
      return 1;
    case 'rf_cdek':
    case 'rf_yandex':
      return 5;
    default:
      return 3;
  }
}

export function calculateDeliveryPriceRub(input: {
  provider: DeliveryProviderType;
  city: string;
  itemsSubtotalRub: number;
  rate: DeliveryRateRow | null;
  siteDelivery?: SiteDeliverySettings;
}): number {
  const { provider, city, itemsSubtotalRub, rate, siteDelivery } = input;

  if (!rate) {
    throw new Error(`Delivery rate not found for ${provider}`);
  }

  if (rate.city_scope !== resolveCityScope(city)) {
    throw new Error(`Provider ${provider} is not available for city scope`);
  }

  let price = rate.base_price;

  if (provider === 'spb_courier') {
    const freeFrom = siteDelivery?.spbFreeFrom ?? 5000;
    if (itemsSubtotalRub >= freeFrom) {
      price = 0;
    } else {
      price = siteDelivery?.spbFrom ?? rate.base_price;
    }
  }

  if (provider === 'rf_cdek' || provider === 'rf_yandex') {
    price = siteDelivery?.russiaFrom ?? rate.base_price;
  }

  if (rate.fee_percent > 0 && itemsSubtotalRub > 0) {
    price += Math.round((itemsSubtotalRub * rate.fee_percent) / 100);
  }

  return Math.max(0, Math.round(price));
}
