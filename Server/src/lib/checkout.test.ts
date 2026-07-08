import { describe, expect, it } from 'vitest';
import { cartMatchesQuoteItems } from '../lib/cart-quote.js';
import { hashCheckoutBody, assertIdempotencyBodyMatch } from '../lib/idempotency.js';
import { ConflictError } from '../lib/errors.js';

describe('cartMatchesQuoteItems', () => {
  it('matches identical cart and quote items', () => {
    const lines = [{ variantId: 'a', quantity: 2, addedAt: 't' }];
    expect(
      cartMatchesQuoteItems(lines, [{ variantId: 'a', quantity: 2 }]),
    ).toBe(true);
  });

  it('rejects mismatched quantities', () => {
    const lines = [{ variantId: 'a', quantity: 2, addedAt: 't' }];
    expect(
      cartMatchesQuoteItems(lines, [{ variantId: 'a', quantity: 1 }]),
    ).toBe(false);
  });
});

describe('idempotency', () => {
  it('hashes checkout body deterministically', () => {
    const body = { customer: { phone: '+79991234567' } };
    expect(hashCheckoutBody(body)).toBe(hashCheckoutBody(body));
  });

  it('detects payload conflict', () => {
    expect(() => assertIdempotencyBodyMatch('a', 'b')).toThrow(ConflictError);
  });
});
