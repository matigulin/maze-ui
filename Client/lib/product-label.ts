/** Чистые хелперы подписей товара (shared/lib — без зависимости от entities). */

/** Человекочитаемый fallback из slug: ps5-slim → Ps5 slim */
export function humanizeSlug(slug: string): string {
  const s = slug.trim();
  if (!s) return "";
  return s
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

/** Название подкатегории для UI; slug — только fallback. */
export function productCategoryLabel(input: {
  subcategoryName?: string | null;
  subcategorySlug?: string | null;
}): string {
  const name = input.subcategoryName?.trim();
  if (name) return name;
  return humanizeSlug(input.subcategorySlug ?? "");
}
