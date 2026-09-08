import type { Product } from "@/lib/data";

export type AddItemOpts = {
  color?: string;
  memory?: string;
  qty?: number;
  silent?: boolean;
  variantId?: string;
};

/** Intent «добавить в корзину» до успешного входа. */
export type PendingAddItem = {
  product: Product;
  opts: AddItemOpts;
};
