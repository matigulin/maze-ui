import type { Product } from "@/lib/data";

export type CartItem = {
  key: string;
  product: Product;
  variantId?: string;
  qty: number;
  /** Макс. qty по складу + лимиту корзины (с API). */
  maxQuantity: number;
  /** Реальный остаток на складе (без лимита корзины). */
  quantityAvailable?: number;
  inStock?: boolean;
  color?: string;
  memory?: string;
};
