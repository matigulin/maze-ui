import type { Product, ColorOption, Spec, Badge } from "@/lib/data";
import { resolveMediaUrl, resolveMediaUrls } from "@/lib/media-url";
import { productCategoryLabel } from "@/lib/product-label";

export type ProductListItemDto = {
  id: string;
  slug: string;
  title: string;
  brandName: string;
  brandSlug: string;
  subcategorySlug: string;
  subcategoryName?: string;
  priceFrom: number;
  oldPriceFrom: number | null;
  mainImageUrl: string | null;
  inStock: boolean;
  quantityAvailable: number;
  badges: string[];
};

export type ProductVariantDto = {
  id: string;
  sku: string;
  memory: string | null;
  color: string;
  colorHex: string;
  price: number;
  oldPrice: number | null;
  inStock: boolean;
  quantityAvailable: number;
};

export type ProductDetailDto = {
  id: string;
  slug: string;
  title: string;
  brandName: string;
  brandSlug: string;
  subcategorySlug: string;
  subcategoryName?: string;
  deviceType: string;
  description: string | null;
  images: string[];
  features: Array<{ title: string; description: string; icon: string | null }>;
  specifications: Record<string, Record<string, string>>;
  variants: ProductVariantDto[];
  badges: string[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
};

function mapBadgesToBadge(badges: string[]): Badge {
  const set = new Set(badges.map((b) => b.toLowerCase()));
  if (set.has("new")) return "NEW";
  if (set.has("hit")) return "HIT";
  if (set.has("sale")) return "SALE";
  return null;
}

function pickTint(variants: Array<{ colorHex: string }> | undefined): [string, string] {
  const c1 = variants?.[0]?.colorHex ?? "#22d3ee";
  // Второй цвет — фиолетовый “стеклянный” по умолчанию
  return [c1, "#a78bfa"];
}

function pickGlyph(title: string, fallback: string) {
  const cleaned = title.replace(/[\"'()]/g, "");
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const last = parts.slice(-2).join(" ");
  return last || fallback;
}

function uniq<T>(arr: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    const k = key(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

export function mapProductListItemToUiProduct(item: ProductListItemDto): Product {
  const badges = mapBadgesToBadge(item.badges);
  return {
    id: item.id,
    slug: item.slug,
    name: item.title,
    brand: item.brandName,
    category: productCategoryLabel({
      subcategoryName: item.subcategoryName,
      subcategorySlug: item.subcategorySlug,
    }),
    price: item.priceFrom,
    oldPrice: item.oldPriceFrom ?? undefined,
    badge: badges,
    rating: 4.7,
    reviews: 0,
    tint: ["#22d3ee", "#a78bfa"],
    glyph: pickGlyph(item.title, item.slug),
    imageUrl: resolveMediaUrl(item.mainImageUrl),
    quantityAvailable: item.quantityAvailable,
    inStock: item.inStock,
    colors: [],
    memory: undefined,
    specs: [],
    short: "",
  };
}

export function mapProductDetailToUiProduct(dto: ProductDetailDto): Product {
  const variants = dto.variants ?? [];
  const first = variants[0];
  const cheapestInStock =
    variants
      .filter((v) => v.inStock)
      .sort((a, b) => a.price - b.price)[0] ?? first;

  const colorOptions: ColorOption[] = uniq(
    variants.map((v) => ({ name: v.color, hex: v.colorHex })),
    (x) => x.name,
  );

  const memoryOptions = uniq(
    variants
      .map((v) => v.memory)
      .filter((m): m is string => typeof m === "string" && m.length > 0)
      .map((m) => ({ m })),
    (x) => x.m,
  ).map((x) => x.m);

  const specs: Spec[] = (dto.features ?? []).map((f) => ({
    label: f.title,
    value: f.description,
  }));

  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.title,
    brand: dto.brandName,
    category: productCategoryLabel({
      subcategoryName: dto.subcategoryName,
      subcategorySlug: dto.subcategorySlug,
    }),
    price: cheapestInStock?.price ?? 0,
    oldPrice: cheapestInStock?.oldPrice ?? undefined,
    badge: mapBadgesToBadge(dto.badges),
    rating: dto.rating ?? 0,
    reviews: dto.reviewsCount ?? 0,
    tint: pickTint(variants),
    glyph: pickGlyph(dto.title, dto.deviceType || dto.slug),
    imageUrl: resolveMediaUrl(dto.images?.[0] ?? null),
    images: dto.images?.length ? resolveMediaUrls(dto.images) : undefined,
    defaultVariantId: cheapestInStock?.id ?? first?.id,
    quantityAvailable: variants.reduce(
      (sum, v) => sum + Math.max(0, v.quantityAvailable ?? 0),
      0,
    ),
    inStock: dto.inStock,
    variants: variants.map((v) => ({
      id: v.id,
      color: v.color,
      memory: v.memory ?? undefined,
      price: v.price,
      oldPrice: v.oldPrice ?? undefined,
      inStock: v.inStock,
      quantityAvailable: v.quantityAvailable,
    })),
    colors: colorOptions,
    memory: memoryOptions.length ? memoryOptions : undefined,
    specs,
    short: dto.description ?? "",
  };
}

