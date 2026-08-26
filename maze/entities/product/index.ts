/**
 * Entity `product` — публичный API для UI.
 * Чистые хелперы живут в shared/lib; entity реэкспортирует их,
 * чтобы features/components не ходили в mapper-детали.
 */
export {
  humanizeSlug,
  productCategoryLabel,
} from "@/lib/product-label";

export { formatStockCompact, formatStockLabel, isProductInStock } from "@/lib/stock";
