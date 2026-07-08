import type { CartLine } from '../services/cart.service.js';
import type { QuoteItem } from './delivery-calc.js';

export function cartMatchesQuoteItems(cart: CartLine[], quoteItems: QuoteItem[]): boolean {
  if (cart.length !== quoteItems.length) {
    return false;
  }

  const cartMap = new Map(cart.map((line) => [line.variantId, line.quantity]));
  return quoteItems.every((item) => cartMap.get(item.variantId) === item.quantity);
}
