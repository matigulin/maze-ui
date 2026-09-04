const BRAND_TITLE_OVERRIDES: Record<string, string> = {
  APPLE: "Apple",
  SAMSUNG: "Samsung",
  SONY: "Sony",
  MARSHALL: "Marshall",
  DYSON: "Dyson",
  "HARMAN KARDON": "Harman Kardon",
  NOTHING: "Nothing",
  XIAOMI: "Xiaomi",
};

export function formatBrandHint(name: string): string {
  const normalized = name.trim();
  const key = normalized.toUpperCase();
  if (BRAND_TITLE_OVERRIDES[key]) return BRAND_TITLE_OVERRIDES[key];
  if (!normalized) return normalized;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}
