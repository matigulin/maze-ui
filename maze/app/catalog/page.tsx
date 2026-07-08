import { CatalogClient } from "@/components/catalog/CatalogClient";
import { apiGet } from "@/lib/api";
import {
  mapProductListItemToUiProduct,
  type ProductListItemDto,
} from "@/lib/mappers/catalog";

// URL /catalog?cat=<slug> (как в моках) → параметры API /catalog/products
const CAT_MAP: Record<string, { brand?: string; category?: string }> = {
  // “бренды”
  apple: { brand: "apple" },
  samsung: { brand: "samsung" },
  sony: { brand: "sony" },
  marshall: { brand: "marshall" },
  dyson: { brand: "dyson" },
  harman: { brand: "harman" },
  // “категории/направления”
  console: { category: "gaming" },
  accessories: { category: "accessories" },
  used: { category: "used" },
};

type CatalogPagePayload = ProductListItemDto[];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const mapped = sp.cat ? CAT_MAP[sp.cat] : undefined;

  const q = sp.q ?? "";
  const apiQuery: Record<string, unknown> = { limit: 48, page: 1 };
  if (q) apiQuery.search = q;
  if (mapped?.brand) apiQuery.brand = mapped.brand;
  if (mapped?.category) apiQuery.category = mapped.category;

  const items = await apiGet<CatalogPagePayload>("/catalog/products", apiQuery);
  const products = items.map(mapProductListItemToUiProduct);

  return (
    <div className="container-x py-10 md:py-14">
      <div className="mb-8">
        <p className="eyebrow mb-2.5">Каталог MAZE</p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Вся техника
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          {products.length} моделей от ведущих брендов. Оригинал, гарантия,
          рассрочка 0%.
        </p>
      </div>

      <CatalogClient
        products={products}
        initialQuery={sp.q ?? ""}
      />
    </div>
  );
}
