import { describe, expect, it } from 'vitest';
import { mapPublicSettings } from '../services/settings.service.js';
import { parseProductListQuery } from '../services/catalog.service.js';

describe('mapPublicSettings', () => {
  it('maps site config to public API shape', () => {
    const result = mapPublicSettings({
      phone: '+79991234567',
      address: 'СПб, Чайковского 56',
      metro: 'Чернышевская',
      hours: '11:30 – 20:30',
      social: {
        telegram: 'https://t.me/maze',
        vk: 'https://vk.com/maze',
        youtube: '',
        telegramUsed: '',
      },
      mapCenter: [59.94, 30.36],
    });

    expect(result.storeName).toBe('MAZE');
    expect(result.phone).toBe('+79991234567');
    expect(result.mapCoordinates).toEqual({ lat: 59.94, lng: 30.36 });
    expect(result.socialLinks.telegram).toBe('https://t.me/maze');
  });
});

describe('parseProductListQuery', () => {
  it('applies defaults and parses filters', () => {
    const result = parseProductListQuery({
      category: 'apple',
      priceMax: '150000',
      inStock: 'true',
      sort: 'price_asc',
    });

    expect(result).toEqual({
      category: 'apple',
      brand: undefined,
      priceMin: undefined,
      priceMax: 150000,
      memory: undefined,
      color: undefined,
      inStock: true,
      sort: 'price_asc',
      page: 1,
      limit: 24,
    });
  });

  it('rejects invalid sort', () => {
    expect(() => parseProductListQuery({ sort: 'invalid' })).toThrow('Invalid catalog query parameters');
  });
});
