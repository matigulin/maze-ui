import { CATEGORIES } from "@/lib/data";

/** Маппинг ?cat= из шапки → API-фильтры и UI-чекбоксы каталога. */
export const CATALOG_ROUTE_MAP: Record<
  string,
  { brand?: string; category?: string; uiBrand?: string; uiCategory?: string }
> = {
  apple: { brand: "apple", uiBrand: "Apple" },
  samsung: { brand: "samsung", uiBrand: "Samsung" },
  sony: { brand: "sony", uiBrand: "Sony" },
  marshall: { brand: "marshall", uiBrand: "Marshall" },
  dyson: { brand: "dyson", uiBrand: "Dyson" },
  harman: { brand: "harman", uiBrand: "Harman Kardon" },
  console: { category: "gaming", uiCategory: "Игровые приставки" },
  accessories: { category: "accessories", uiCategory: "Аудио" },
  used: { category: "used" },
};

export function getCatalogRouteApiFilter(cat?: string | null) {
  if (!cat) return undefined;
  const mapped = CATALOG_ROUTE_MAP[cat];
  if (!mapped) return undefined;
  return { brand: mapped.brand, category: mapped.category };
}

/** Подпись фильтра из ?cat= (Apple, Б/У техника, …). */
export function getRouteFilterLabel(cat?: string | null): string | null {
  if (!cat) return null;
  return CATEGORIES.find((c) => c.slug === cat)?.name ?? null;
}

/** Начальные чекбоксы из ?cat= для синхронизации с серверной выборкой. */
export function resolveRouteFilterSelections(cat?: string | null): {
  brands: string[];
  cats: string[];
} {
  const mapped = cat ? CATALOG_ROUTE_MAP[cat] : undefined;
  if (!mapped) return { brands: [], cats: [] };
  return {
    brands: mapped.uiBrand ? [mapped.uiBrand] : [],
    cats: mapped.uiCategory ? [mapped.uiCategory] : [],
  };
}
