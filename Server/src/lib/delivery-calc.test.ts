import { describe, expect, it } from 'vitest';
import {
  buildQuoteRequestHash,
  calculateDeliveryPriceRub,
  resolveCityScope,
} from '../lib/delivery-calc.js';

describe('delivery calc', () => {
  it('detects SPB city scope', () => {
    expect(resolveCityScope('Санкт-Петербург')).toBe('spb');
    expect(resolveCityScope('Москва')).toBe('rf');
  });

  it('builds stable request hash', () => {
    const input = {
      provider: 'spb_courier' as const,
      city: 'Санкт-Петербург',
      items: [{ variantId: 'a', quantity: 1 }],
    };
    const hash1 = buildQuoteRequestHash(input, 'guest:1');
    const hash2 = buildQuoteRequestHash(input, 'guest:1');
    expect(hash1).toBe(hash2);
  });

  it('applies free SPB courier threshold', () => {
    const price = calculateDeliveryPriceRub({
      provider: 'spb_courier',
      city: 'Санкт-Петербург',
      itemsSubtotalRub: 6000,
      rate: {
        delivery_type: 'spb_courier',
        city_scope: 'spb',
        base_price: 500,
        fee_percent: 0,
      },
      siteDelivery: { spbFreeFrom: 5000, spbFrom: 500 },
    });

    expect(price).toBe(0);
  });

  it('adds RF fee percent', () => {
    const price = calculateDeliveryPriceRub({
      provider: 'rf_cdek',
      city: 'Москва',
      itemsSubtotalRub: 100000,
      rate: {
        delivery_type: 'rf_cdek',
        city_scope: 'rf',
        base_price: 1000,
        fee_percent: 4,
      },
      siteDelivery: { russiaFrom: 1000 },
    });

    expect(price).toBe(5000);
  });
});
