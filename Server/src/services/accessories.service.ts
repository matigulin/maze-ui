import { Accessory } from '../models/reference.js';
import { toNumber } from '../lib/decimal.js';

export type AccessoryDto = {
  id: string;
  name: string;
  category: 'glass' | 'case' | 'charger' | 'other';
  priceRub: number;
  image: string | null;
};

function mapAccessory(row: Accessory): AccessoryDto {
  return {
    id: row.id,
    name: row.name,
    category: row.get('category') as AccessoryDto['category'],
    priceRub: toNumber(row.get('price') as string),
    image: (row.get('image') as string | null) ?? null,
  };
}

export async function listActiveAccessories(): Promise<AccessoryDto[]> {
  const rows = await Accessory.findAll({
    where: { is_active: true },
    order: [
      ['category', 'ASC'],
      ['name', 'ASC'],
    ],
  });
  return rows.map(mapAccessory);
}

export async function assertInstallmentAccessoryIds(ids: string[]): Promise<void> {
  const unique = [...new Set(ids)];
  if (unique.length !== 3) {
    throw new Error('INSTALLMENT_BUNDLE_INVALID');
  }

  const rows = await Accessory.findAll({
    where: { id: unique, is_active: true },
    attributes: ['id', 'category'],
  });

  if (rows.length !== 3) {
    throw new Error('INSTALLMENT_BUNDLE_INVALID');
  }

  const categories = new Set(rows.map((r) => r.get('category') as string));
  if (!categories.has('glass') || !categories.has('case') || !categories.has('charger')) {
    throw new Error('INSTALLMENT_BUNDLE_INVALID');
  }
}
