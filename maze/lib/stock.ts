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
