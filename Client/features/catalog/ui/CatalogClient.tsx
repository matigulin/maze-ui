"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import {
  CheckRow,
  FilterGroup,
  PriceFilter,
  getRouteFilterLabel,
  resolveRouteFilterSelections,
} from "@/features/catalog-filters";
import { MobileDrawer } from "@/shared/ui/mobile-drawer";
import { plural, cn } from "@/lib/utils";

type Sort = "pop" | "cheap" | "exp" | "new";

const SORTS: { key: Sort; label: string }[] = [
  { key: "pop", label: "Популярные" },
  { key: "cheap", label: "Сначала дешёвые" },
  { key: "exp", label: "Сначала дорогие" },
  { key: "new", label: "Новинки" },
];

function ResetFiltersButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border border-line py-2.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent cursor-pointer",
        className,
      )}
    >
      Сбросить фильтры
    </button>
  );
}

export function CatalogClient({
  products,
  initialQuery = "",
  initialBrand,
  initialCategory,
  initialCat,
}: {
  products: Product[];
  initialQuery?: string;
  initialBrand?: string;
  initialCategory?: string;
  /** ?cat= из URL (Apple, Б/У, …) */
  initialCat?: string;
}) {
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);
  const routeSelections = useMemo(
    () => resolveRouteFilterSelections(initialCat),
    [initialCat],
  );

  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand))],
    [products],
  );
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products],
  );
  const maxPrice = useMemo(() => {
    if (!products.length) return 0;
    return Math.max(...products.map((p) => p.price));
  }, [products]);

  const [query, setQuery] = useState(initialQuery);
  const [selBrands, setSelBrands] = useState<string[]>(() => {
    if (initialBrand) return [initialBrand];
    return routeSelections.brands;
  });
  const [selCats, setSelCats] = useState<string[]>(() => {
    if (initialCategory) return [initialCategory];
    return routeSelections.cats;
  });
  const [price, setPrice] = useState(maxPrice);
  const [sort, setSort] = useState<Sort>("pop");
  const [mobileFilters, setMobileFilters] = useState(false);

  const routeFilterLabel = getRouteFilterLabel(initialCat);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (selBrands.length && !selBrands.includes(p.brand)) return false;
      if (selCats.length && !selCats.includes(p.category)) return false;
      if (maxPrice > 0 && p.price > price) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "cheap") return a.price - b.price;
      if (sort === "exp") return b.price - a.price;
      if (sort === "new")
        return (b.badge === "NEW" ? 1 : 0) - (a.badge === "NEW" ? 1 : 0);
      return b.reviews - a.reviews;
    });
    return list;
  }, [products, query, selBrands, selCats, price, sort, maxPrice]);

  const priceFilterActive = maxPrice > 0 && price < maxPrice;
  const activeCount =
    selBrands.length +
    selCats.length +
    (priceFilterActive ? 1 : 0) +
    (query.trim() ? 1 : 0) +
    (initialCat ? 1 : 0);

  const hasActiveFilters = activeCount > 0;

  function scrollResultsToTop() {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function reset() {
    setSelBrands([]);
    setSelCats([]);
    setPrice(maxPrice);
    setQuery("");
    setMobileFilters(false);
    router.push("/catalog");
    scrollResultsToTop();
  }

  function onPriceChange(next: number) {
    setPrice(next);
    scrollResultsToTop();
  }

  const FilterPanel = (
    <div className="space-y-7">
      <div className="sticky top-0 z-10 -mx-5 bg-[var(--color-panel)]/95 px-5 pb-4 pt-1 backdrop-blur-md">
        <PriceFilter
          price={price}
          maxPrice={maxPrice}
          onChange={onPriceChange}
        />
      </div>

      {routeFilterLabel && initialCat === "used" && (
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-xs text-accent">
            {routeFilterLabel}
          </span>
        </div>
      )}

      {brands.length > 0 && (
        <FilterGroup title="Бренд">
          {brands.map((b) => (
            <CheckRow
              key={b}
              label={b}
              checked={selBrands.includes(b)}
              onClick={() => toggle(selBrands, setSelBrands, b)}
            />
          ))}
        </FilterGroup>
      )}

      {categories.length > 0 && (
        <FilterGroup title="Категория">
          {categories.map((c) => (
            <CheckRow
              key={c}
              label={c}
              checked={selCats.includes(c)}
              onClick={() => toggle(selCats, setSelCats, c)}
            />
          ))}
        </FilterGroup>
      )}
    </div>
  );

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden min-w-0 lg:block lg:w-[15rem] lg:shrink-0">
        <div className="border border-line bg-bg-2 sticky top-24 flex max-h-[calc(100dvh-7rem)] flex-col overflow-hidden rounded-2xl">
          {hasActiveFilters && (
            <div className="shrink-0 border-b border-line px-5 pb-4 pt-5">
              <ResetFiltersButton onClick={reset} />
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">
            {FilterPanel}
          </div>
        </div>
      </aside>

      <div ref={resultsRef} className="min-w-0 w-full max-w-full scroll-mt-28">
        <div className="mb-5 flex min-w-0 flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
            <div className="text-sm text-muted">
              <span className="font-display text-lg font-semibold text-ink">
                {filtered.length}
              </span>{" "}
              {plural(filtered.length, ["товар", "товара", "товаров"])}
              {routeFilterLabel && initialCat ? (
                <span className="ml-2 text-faint">· {routeFilterLabel}</span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={reset}
                  className="hidden rounded-full border border-line px-3.5 py-2 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent sm:inline-flex cursor-pointer"
                >
                  Сбросить фильтры
                </button>
              )}

              <button
                type="button"
                onClick={() => setMobileFilters(true)}
                className="flex shrink-0 items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm text-muted transition-colors hover:text-ink lg:hidden cursor-pointer"
              >
                <SlidersHorizontal size={15} />
                Фильтры
                {activeCount > 0 && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-cyan text-[11px] font-bold text-[#04121a]">
                    {activeCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex max-w-full gap-1.5 overflow-x-auto pb-0.5 sm:ml-auto sm:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SORTS.map((s) => (
              <button
                type="button"
                key={s.key}
                onClick={() => setSort(s.key)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer",
                  sort === s.key
                    ? "bg-white/10 text-ink"
                    : "text-muted hover:text-ink",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length ? (
          <div className="grid w-full grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 [grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] lg:[grid-template-columns:repeat(3,minmax(0,1fr))]">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="min-w-0 max-w-full"
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="border border-line bg-panel grid place-items-center rounded-2xl py-20 text-center">
            <p className="text-lg font-medium">Ничего не найдено</p>
            <p className="mt-1 text-sm text-muted">
              Попробуйте изменить фильтры или сбросить их.
            </p>
            {hasActiveFilters && (
              <button type="button" onClick={reset} className="btn-ghost mt-5">
                Сбросить фильтры
              </button>
            )}
          </div>
        )}
      </div>

      <MobileDrawer
        open={mobileFilters}
        onClose={() => setMobileFilters(false)}
        side="left"
        rootClassName="lg:hidden"
        aria-label="Фильтры каталога"
      >
        <div className="shrink-0 border-b border-line p-6 pb-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Фильтры</h2>
            <button
              type="button"
              onClick={() => setMobileFilters(false)}
              aria-label="Закрыть"
              className="grid h-9 w-9 place-items-center rounded-full text-muted hover:text-ink cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
          {hasActiveFilters && (
            <ResetFiltersButton onClick={reset} className="mt-4" />
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {FilterPanel}
          <button
            type="button"
            onClick={() => setMobileFilters(false)}
            className="btn-primary mt-7 w-full"
          >
            Показать {filtered.length}
          </button>
        </div>
      </MobileDrawer>
    </div>
  );
}
