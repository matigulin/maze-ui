import { apiGet, ApiError } from "@/lib/api";
import { shouldUseMocks } from "@/lib/mocks";
import {
  getProduct,
  products,
  relatedProducts,
  type Product,
} from "@/lib/data";
import {
  mapProductDetailToUiProduct,
  mapProductListItemToUiProduct,
  type ProductDetailDto,
  type ProductListItemDto,
} from "@/lib/mappers/catalog";

const CAT_MAP: Record<string, { brand?: string; category?: string }> = {
  apple: { brand: "apple" },
  samsung: { brand: "samsung" },
  sony: { brand: "sony" },
  marshall: { brand: "marshall" },
  dyson: { brand: "dyson" },
  harman: { brand: "harman" },
  console: { category: "gaming" },
  accessories: { category: "accessories" },
  used: { category: "used" },
};

function filterMockProducts(opts: {
  q?: string;
  cat?: string;
}): Product[] {
  const mapped = opts.cat ? CAT_MAP[opts.cat] : undefined;
  const q = opts.q?.toLowerCase() ?? "";

  return products.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (mapped?.brand && p.brand.toLowerCase() !== mapped.brand) return false;
    if (mapped?.category) {
      const catSlug = mapped.category;
      if (catSlug === "gaming" && p.category !== "Игровые приставки")
        return false;
      if (catSlug === "accessories" && p.category !== "Аудио") return false;
    }
    return true;
  });
}

export async function fetchEditorChoice(): Promise<Product[]> {
  if (shouldUseMocks()) {
    return [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 8);
  }
  const home = await apiGet<{ editorChoice: ProductListItemDto[] }>("/home");
  return home.editorChoice.map(mapProductListItemToUiProduct);
}

export async function fetchNewProducts(): Promise<Product[]> {
  if (shouldUseMocks()) {
    return products.filter((p) => p.badge === "NEW").slice(0, 4);
  }
  const home = await apiGet<{ editorChoice: ProductListItemDto[] }>("/home");
  return home.editorChoice
    .filter((p) => p.badges.map((b) => b.toLowerCase()).includes("new"))
    .slice(0, 4)
    .map(mapProductListItemToUiProduct);
}

export async function fetchCatalogProducts(opts: {
  q?: string;
  cat?: string;
}): Promise<Product[]> {
  if (shouldUseMocks()) {
    return filterMockProducts(opts);
  }

  const mapped = opts.cat ? CAT_MAP[opts.cat] : undefined;
  const apiQuery: Record<string, unknown> = { limit: 48, page: 1 };
  if (opts.q) apiQuery.search = opts.q;
  if (mapped?.brand) apiQuery.brand = mapped.brand;
  if (mapped?.category) apiQuery.category = mapped.category;

  const items = await apiGet<ProductListItemDto[]>(
    "/catalog/products",
    apiQuery,
  );
  return items.map(mapProductListItemToUiProduct);
}

export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  if (shouldUseMocks()) {
    return getProduct(slug) ?? null;
  }

  try {
    const dto = await apiGet<ProductDetailDto>(`/catalog/products/${slug}`);
    return mapProductDetailToUiProduct(dto);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function fetchRelatedProducts(
  slug: string,
  n = 4,
): Promise<Product[]> {
  if (shouldUseMocks()) {
    return relatedProducts(slug, n);
  }

  const dto = await apiGet<ProductDetailDto>(`/catalog/products/${slug}`);
  const relatedItems = await apiGet<ProductListItemDto[]>(
    "/catalog/products",
    { brand: dto.brandSlug, limit: 8 },
  );
  return relatedItems
    .filter((x) => x.slug !== slug)
    .slice(0, n)
    .map(mapProductListItemToUiProduct);
}
