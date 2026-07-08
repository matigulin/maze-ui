import { describe, expect, it } from 'vitest';
import {
  assertMaxLines,
  clampQuantity,
  mergeLines,
  type CartLine,
} from '../services/cart.service.js';
import { ConflictError, ValidationError } from '../lib/errors.js';

describe('cart rules', () => {
  it('merges guest lines into user cart', () => {
    const user: CartLine[] = [
      { variantId: 'a', quantity: 2, addedAt: '2026-01-01T00:00:00.000Z' },
    ];
    const guest: CartLine[] = [
      { variantId: 'a', quantity: 3, addedAt: '2026-01-02T00:00:00.000Z' },
      { variantId: 'b', quantity: 1, addedAt: '2026-01-02T00:00:00.000Z' },
    ];

    const merged = mergeLines(guest, user);
    expect(merged).toHaveLength(2);
    expect(merged.find((line) => line.variantId === 'a')?.quantity).toBe(5);
  });

  it('rejects quantity above per-line limit', () => {
    expect(() => clampQuantity(11)).toThrow(ConflictError);
  });

  it('rejects invalid quantity', () => {
    expect(() => clampQuantity(0)).toThrow(ValidationError);
  });

  it('rejects too many lines', () => {
    expect(() => assertMaxLines(31)).toThrow(ConflictError);
  });
});
