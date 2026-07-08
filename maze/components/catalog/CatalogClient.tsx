"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import type { Product } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice, plural, cn } from "@/lib/utils";

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
  const maxPrice = useMemo(
    () => Math.max(...products.map((p) => p.price)),
    [products],
  );

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

      <FilterGroup title="Цена">
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={1000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="maze-range w-full"
            aria-label="Максимальная цена"
          />
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-faint">0 ₽</span>
            <span className="rounded-lg border border-line bg-white/[0.03] px-2.5 py-1 font-medium text-cyan">
              до {formatPrice(price)}
            </span>
          </div>
        </div>
      </FilterGroup>

      {activeCount > 0 && (
        <button
          onClick={reset}
          className="w-full rounded-xl border border-line py-2.5 text-sm text-muted transition-colors hover:border-magenta/50 hover:text-magenta cursor-pointer"
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="glass sticky top-24 rounded-3xl p-6">{FilterPanel}</div>
      </aside>

      <div>
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="text-sm text-muted">
            <span className="font-display text-lg font-semibold text-ink">
              {filtered.length}
            </span>{" "}
            {plural(filtered.length, ["товар", "товара", "товаров"])}
          </div>

          <button
            onClick={() => setMobileFilters(true)}
            className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:text-ink lg:hidden cursor-pointer"
          >
            <SlidersHorizontal size={15} />
            Фильтры
            {activeCount > 0 && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-cyan text-[11px] font-bold text-[#04121a]">
                {activeCount}
              </span>
            )}
          </button>

          <div className="ml-auto flex gap-1.5">
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={cn(
                  "rounded-full px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer",
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

        {/* Grid */}
        {filtered.length ? (
          <motion.div layout className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="glass grid place-items-center rounded-3xl py-20 text-center">
            <p className="text-lg font-medium">Ничего не найдено</p>
            <p className="mt-1 text-sm text-muted">
              Попробуйте изменить фильтры или сбросить их.
            </p>
            <button onClick={reset} className="btn-ghost mt-5">
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFilters && (
          <motion.div
            className="fixed inset-0 z-[95] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileFilters(false)}
            />
            <motion.div
              className="glass-strong absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto border-r border-line p-6"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Фильтры</h2>
                <button
                  onClick={() => setMobileFilters(false)}
                  aria-label="Закрыть"
                  className="grid h-9 w-9 place-items-center rounded-full text-muted hover:text-ink cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              {FilterPanel}
              <button
                onClick={() => setMobileFilters(false)}
                className="btn-primary mt-7 w-full"
              >
                Показать {filtered.length}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-faint">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg py-1 text-left text-sm text-muted transition-colors hover:text-ink cursor-pointer"
    >
      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
          checked
            ? "border-cyan bg-cyan text-[#04121a]"
            : "border-line bg-white/[0.02]",
        )}
      >
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}
