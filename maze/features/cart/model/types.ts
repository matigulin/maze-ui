import type { Product } from "@/lib/data";

export type CartItem = {
  key: string;
  product: Product;
  variantId?: string;
  qty: number;
  /** Макс. qty по складу + лимиту корзины (с API). */
  maxQuantity: number;
  inStock?: boolean;
  color?: string;
  memory?: string;
};
