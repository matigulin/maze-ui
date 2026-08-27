"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import {
  CheckRow,
  FilterGroup,
  PriceFilter,
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

export function CatalogClient({
  products,
  initialQuery = "",
  initialBrand,
  initialCategory,
}: {
  products: Product[];
  initialQuery?: string;
  initialBrand?: string;
  initialCategory?: string;
}) {
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
  const [selBrands, setSelBrands] = useState<string[]>(
    initialBrand ? [initialBrand] : [],
  );
  const [selCats, setSelCats] = useState<string[]>(
    initialCategory ? [initialCategory] : [],
  );
  const [price, setPrice] = useState(maxPrice);
  const [sort, setSort] = useState<Sort>("pop");
  const [mobileFilters, setMobileFilters] = useState(false);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (selBrands.length && !selBrands.includes(p.brand)) return false;
      if (selCats.length && !selCats.includes(p.category)) return false;
      if (p.price > price) return false;
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
  }, [products, query, selBrands, selCats, price, sort]);

  const activeCount =
    selBrands.length + selCats.length + (price < maxPrice ? 1 : 0);

  function reset() {
    setSelBrands([]);
    setSelCats([]);
    setPrice(maxPrice);
    setQuery("");
  }

  const FilterPanel = (
    <div className="space-y-7">
      <PriceFilter price={price} maxPrice={maxPrice} onChange={setPrice} />

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

      {activeCount > 0 && (
        <button
          type="button"
          onClick={reset}
          className="w-full rounded-xl border border-line py-2.5 text-sm text-muted transition-colors hover:border-magenta/50 hover:text-magenta cursor-pointer"
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden min-w-0 lg:block lg:w-[15rem] lg:shrink-0">
        <div className="glass sticky top-24 max-h-[calc(100dvh-7rem)] w-full overflow-y-auto rounded-3xl p-5 xl:p-6">
          {FilterPanel}
        </div>
      </aside>

      <div className="min-w-0 w-full max-w-full">
        <div className="mb-5 flex min-w-0 flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted">
              <span className="font-display text-lg font-semibold text-ink">
                {filtered.length}
              </span>{" "}
              {plural(filtered.length, ["товар", "товара", "товаров"])}
            </div>

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
          <div className="glass grid place-items-center rounded-3xl py-20 text-center">
            <p className="text-lg font-medium">Ничего не найдено</p>
            <p className="mt-1 text-sm text-muted">
              Попробуйте изменить фильтры или сбросить их.
            </p>
            <button type="button" onClick={reset} className="btn-ghost mt-5">
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

      <MobileDrawer
        open={mobileFilters}
        onClose={() => setMobileFilters(false)}
        side="left"
        rootClassName="lg:hidden"
      >
        <div className="shrink-0 border-b border-line p-6 pb-4">
          <div className="flex items-center justify-between">
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
