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
  const key = name.trim().toUpperCase();
  if (BRAND_TITLE_OVERRIDES[key]) return BRAND_TITLE_OVERRIDES[key];
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
