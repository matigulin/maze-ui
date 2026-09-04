import { CatalogClient } from "@/features/catalog";
import { fetchCatalogProducts } from "@/lib/catalog-source";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const products = await fetchCatalogProducts({
    q: sp.q,
    cat: sp.cat,
  });

  return (
    <div className="container-x min-w-0 py-8 md:py-14">
      <div className="mb-6 md:mb-8">
        <p className="eyebrow mb-2.5">Каталог MAZE</p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
          Вся техника
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          {products.length} моделей от ведущих брендов. Оригинал, гарантия,
          рассрочка 0%.
        </p>
      </div>

      <CatalogClient
        key={`${sp.q ?? ""}:${sp.cat ?? ""}`}
        products={products}
        initialQuery={sp.q ?? ""}
        initialCat={sp.cat}
      />
    </div>
  );
}
