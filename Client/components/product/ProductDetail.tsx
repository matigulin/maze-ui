"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  Repeat,
  Star,
  Check,
} from "lucide-react";
import type { Product } from "@/lib/data";
import { ProductThumb } from "@/components/ProductThumb";
import { useCart } from "@/components/store";
import { formatPrice, cn } from "@/lib/utils";
import { formatStockLabel } from "@/lib/stock";

const ANGLES = [135, 90, 200, 45];

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, toggleWishlist, isWished } = useCart();
  const [view, setView] = useState(0);
  const [color, setColor] = useState(product.colors[0]?.name);
  const [memory, setMemory] = useState(product.memory?.[0]);
  const [qtyRaw, setQtyRaw] = useState(1);
  const wished = isWished(product.id);
  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : [null, null, null, null];

  const selectedVariant = useMemo(() => {
    const variants = product.variants ?? [];
    if (variants.length === 0) return undefined;
    return (
      variants.find(
        (v) =>
          (color == null || v.color === color) &&
          (memory == null || v.memory == null || v.memory === memory),
      ) ??
      variants.find((v) => v.inStock) ??
      variants[0]
    );
  }, [product.variants, color, memory]);

  const stockQty =
    selectedVariant?.quantityAvailable ?? product.quantityAvailable ?? 0;
  const maxQty = Math.max(0, stockQty);
  const canBuy = maxQty > 0;
  const qty = maxQty <= 0 ? 1 : Math.min(Math.max(1, qtyRaw), maxQty);

  const setQty = (next: number | ((prev: number) => number)) => {
    setQtyRaw((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      if (maxQty <= 0) return 1;
      return Math.min(Math.max(1, value), maxQty);
    });
  };

  const unitPrice = selectedVariant?.price ?? product.price;
  const unitOldPrice = selectedVariant?.oldPrice ?? product.oldPrice;

  const discount = unitOldPrice
    ? Math.round((1 - unitPrice / unitOldPrice) * 100)
    : 0;

  const lineTotal = formatPrice(unitPrice * qty);

  function onAdd() {
    if (!canBuy) return;
    void addItem(product, { color, memory, qty });
  }

  function decQty() {
    setQty((q) => Math.max(1, q - 1));
  }

  function incQty() {
    if (maxQty <= 0) return;
    setQty((q) => Math.min(maxQty, q + 1));
  }

  return (
    <div className="space-y-12 pb-28 sm:space-y-16 lg:pb-0">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        {/* Галерея */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <motion.div
            key={view}
            initial={{ opacity: 0.4, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="iri-ring relative"
          >
            {gallery[view] ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
                <Image
                  src={gallery[view]!}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            ) : (
              <ProductThumb
                product={product}
                angle={ANGLES[view]}
                className="aspect-square w-full"
                glyphClassName="text-3xl"
              />
            )}
            {product.badge && (
              <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
                {product.badge}
              </span>
            )}
          </motion.div>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4 sm:gap-3">
            {gallery.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setView(i)}
                aria-label={`Вид ${i + 1}`}
                className={cn(
                  "overflow-hidden rounded-xl border-2 transition-colors cursor-pointer sm:rounded-2xl",
                  view === i ? "border-cyan" : "border-transparent",
                )}
              >
                {img ? (
                  <div className="relative aspect-square w-full">
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <ProductThumb
                    product={product}
                    angle={ANGLES[i]}
                    className="aspect-square w-full"
                    glyphClassName="text-[0.6rem]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Инфо */}
        <div>
          <div className="mb-2 flex min-w-0 items-center gap-1.5 text-sm text-faint">
            <span className="truncate">{product.brand}</span>
            <span className="shrink-0">·</span>
            <span className="truncate">{product.category}</span>
          </div>
          <h1 className="font-display text-[1.65rem] font-bold leading-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star
                  key={k}
                  size={15}
                  className={cn(
                    k < Math.round(product.rating)
                      ? "fill-gold text-gold"
                      : "text-line",
                  )}
                />
              ))}
            </div>
            <span className="font-medium text-ink">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-faint">· {product.reviews} отзывов</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted sm:mt-5 sm:text-base">
            {product.short}
          </p>

          <div className="mt-5 flex flex-wrap items-end gap-2 sm:mt-6 sm:gap-3">
            <span className="font-display text-3xl font-bold text-iri sm:text-4xl">
              {formatPrice(unitPrice)}
            </span>
            {unitOldPrice && (
              <span className="mb-0.5 flex items-center gap-2 sm:mb-1">
                <span className="text-base text-faint line-through sm:text-lg">
                  {formatPrice(unitOldPrice)}
                </span>
                <span className="rounded-full bg-magenta/15 px-2 py-0.5 text-xs font-semibold text-magenta">
                  −{discount}%
                </span>
              </span>
            )}
          </div>

          <p
            className={cn(
              "mt-3 text-sm font-medium",
              canBuy ? "text-cyan" : "text-faint",
            )}
          >
            {formatStockLabel(stockQty)}
          </p>

          {product.colors.length > 0 && (
            <div className="mt-6 sm:mt-7">
              <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-faint">
                Цвет: <span className="text-ink">{color}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-bg transition-all cursor-pointer",
                      color === c.name ? "ring-cyan" : "ring-transparent",
                    )}
                  >
                    <span
                      className="h-7 w-7 rounded-full border border-white/10"
                      style={{ background: c.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.memory && product.memory.length > 0 && (
            <div className="mt-5 sm:mt-6">
              <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-faint">
                Память
              </p>
              <div className="flex flex-wrap gap-2">
                {product.memory.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMemory(m)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-sm transition-colors cursor-pointer sm:px-4",
                      memory === m
                        ? "border-cyan bg-cyan/10 text-ink"
                        : "border-line text-muted hover:border-white/25",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop / tablet CTA */}
          <div className="mt-7 hidden items-center gap-3 sm:mt-8 lg:flex lg:flex-wrap">
            <div className="flex items-center gap-1 rounded-full border border-line p-1">
              <button
                type="button"
                onClick={decQty}
                aria-label="Меньше"
                disabled={!canBuy || qty <= 1}
                className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-ink cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-medium tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={incQty}
                aria-label="Больше"
                disabled={!canBuy || qty >= maxQty}
                title={
                  qty >= maxQty && maxQty > 0
                    ? `На складе только ${maxQty} шт.`
                    : undefined
                }
                className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-ink cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={onAdd}
              disabled={!canBuy}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {canBuy ? `В корзину · ${lineTotal}` : "Нет в наличии"}
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label="В избранное"
              className={cn(
                "grid h-[52px] w-[52px] place-items-center rounded-full border transition-colors cursor-pointer",
                wished
                  ? "border-magenta/50 bg-magenta/10"
                  : "border-line hover:border-white/25",
              )}
            >
              <Heart
                size={20}
                className={cn(wished && "fill-magenta text-magenta")}
              />
            </button>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
            {[
              { icon: Truck, t: "Доставка", s: "в день заказа" },
              { icon: ShieldCheck, t: "Гарантия", s: "до 3 лет" },
              { icon: Repeat, t: "Трейд-ин", s: "до 30%" },
            ].map(({ icon: I, t, s }) => (
              <div
                key={t}
                className="glass flex flex-col items-center gap-1 rounded-2xl px-1.5 py-3 text-center sm:px-2 sm:py-4"
              >
                <I size={16} className="text-cyan sm:size-[18px]" />
                <span className="text-[11px] font-medium leading-tight sm:text-sm">
                  {t}
                </span>
                <span className="text-[10px] leading-tight text-faint sm:text-xs">
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-display text-xl font-bold sm:mb-6 sm:text-2xl">
          Особенности
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {product.specs.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 sm:p-5">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/15 text-cyan">
                <Check size={16} strokeWidth={2.5} />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-faint sm:text-xs">
                {s.label}
              </p>
              <p className="mt-1 text-sm font-medium text-ink sm:text-base">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky mobile buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[#07080f]/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-line p-0.5">
            <button
              type="button"
              onClick={decQty}
              aria-label="Меньше"
              disabled={!canBuy || qty <= 1}
              className="grid h-10 w-10 place-items-center rounded-full text-muted cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={16} />
            </button>
            <span className="w-6 text-center text-sm font-medium tabular-nums">
              {qty}
            </span>
            <button
              type="button"
              onClick={incQty}
              aria-label="Больше"
              disabled={!canBuy || qty >= maxQty}
              className="grid h-10 w-10 place-items-center rounded-full text-muted cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={!canBuy}
            className="btn-primary min-w-0 flex-1 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canBuy ? `В корзину · ${lineTotal}` : "Нет в наличии"}
          </button>
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label="В избранное"
            className={cn(
              "grid h-12 w-12 shrink-0 place-items-center rounded-full border cursor-pointer",
              wished
                ? "border-magenta/50 bg-magenta/10"
                : "border-line",
            )}
          >
            <Heart
              size={18}
              className={cn(wished && "fill-magenta text-magenta")}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
