export {
  CartProvider,
  useCart,
  type CartAuthAdapter,
} from "./model/cart-provider";
export type { CartItem } from "./model/types";
export type { AddItemOpts, PendingAddItem } from "./model/pending-add";
export { CartClient } from "./ui/CartClient";
export {
  fetchCart,
  addCartLine,
  removeCartLine,
  replaceCartLines,
  clearCartApi,
  resolveVariantId,
} from "./api/cart-api";
export type { CartItemDto, CartDto } from "./api/cart-api";
