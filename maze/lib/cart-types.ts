import type { Product } from "@/lib/data";

export type CartItem = {
  key: string;
  product: Product;
  variantId?: string;
  qty: number;
  color?: string;
  memory?: string;
};
