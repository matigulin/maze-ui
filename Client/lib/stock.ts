/** Подпись остатка для карточки / PDP / корзины. */
export function formatStockLabel(quantity: number | null | undefined): string {
  const qty = Math.max(0, Math.floor(quantity ?? 0));
  if (qty <= 0) return "Нет в наличии";
  return `В наличии ${qty} шт.`;
}

/** Короткая подпись для узкой карточки (2 колонки на мобилке). */
export function formatStockCompact(quantity: number | null | undefined): string {
  const qty = Math.max(0, Math.floor(quantity ?? 0));
  if (qty <= 0) return "Нет";
  return `${qty} шт.`;
}

/** Единая проверка наличия для карточек каталога. */
export function isProductInStock(product: {
  quantityAvailable?: number;
  inStock?: boolean;
}): boolean {
  if (product.inStock === false) return false;
  return (product.quantityAvailable ?? 0) > 0;
}

/** Можно ли ещё добавить с карточки: остаток минус уже лежащее в корзине. */
export function canAddMoreFromCard(
  product: { id: string; slug: string; quantityAvailable?: number; inStock?: boolean },
  cartQtyForProduct: number,
): boolean {
  if (!isProductInStock(product)) return false;
  const stock = Math.max(0, Math.floor(product.quantityAvailable ?? 0));
  return cartQtyForProduct < stock;
}
