"use client";

import Image from "next/image";
import { useState } from "react";
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
import type { Product, ProductVariant } from "@/lib/data";
import { ProductThumb } from "@/components/ProductThumb";
import { useCart } from "@/components/store";
import { formatPrice, cn } from "@/lib/utils";
import {
  findProductVariant,
  isProductSelectionInStock,
} from "@/features/cart";

const ANGLES = [135, 90, 200, 45];

function variantsForColor(product: Product, colorName: string): ProductVariant[] {
  return (product.variants ?? []).filter((v) => v.color === colorName);
}

function colorHasStock(product: Product, colorName: string): boolean {
  const list = variantsForColor(product, colorName);
  if (list.length === 0) return product.inStock !== false;
  return list.some((v) => v.inStock);
}

function memoryAvailableForColor(
  product: Product,
  colorName: string | undefined,
  memoryName: string,
): boolean {
  const variants = product.variants ?? [];
  if (variants.length === 0) return true;
  return variants.some(
    (v) =>
      v.inStock &&
      v.memory === memoryName &&
      (!colorName || v.color === colorName),
  );
}

function pickMemoryForColor(
  product: Product,
  colorName: string | undefined,
  preferred?: string,
): string | undefined {
  const variants = product.variants ?? [];
  if (!variants.length) return preferred ?? product.memory?.[0];

  const forColor = colorName
    ? variants.filter((v) => v.color === colorName)
    : variants;
  const inStock =
    forColor.find((v) => v.inStock && v.memory) ??
    forColor.find((v) => v.inStock) ??
    forColor[0];
  return inStock?.memory ?? preferred ?? product.memory?.[0];
}

function initialSelection(product: Product) {
  // Берём первый цвет из карточки (как в галерее), не «первый в наличии» —
  // иначе при нуле у Natural страница сама прыгает на Blue и кнопка остаётся яркой.
  const color = product.colors[0]?.name ?? product.variants?.[0]?.color;
  const memory = pickMemoryForColor(product, color, product.memory?.[0]);
  return { color, memory };
}

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, toggleWishlist, isWished } = useCart();
  const [view, setView] = useState(0);
  const initial = initialSelection(product);
  const [color, setColor] = useState(initial.color);
  const [memory, setMemory] = useState(initial.memory);
  const [qty, setQty] = useState(1);
  const wished = isWished(product.id);
  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : [null, null, null, null];

  const selection = { color, memory };
  const selectedVariant = findProductVariant(product, selection);
  const inStock = isProductSelectionInStock(product, selection);
  const unitPrice = selectedVariant?.price ?? product.price;
  const unitOldPrice = selectedVariant?.oldPrice ?? product.oldPrice;

  const discount = unitOldPrice
    ? Math.round((1 - unitPrice / unitOldPrice) * 100)
    : 0;

  function selectColor(nextColor: string) {
    setColor(nextColor);
    setMemory((prev) => pickMemoryForColor(product, nextColor, prev));
  }

  return (
    <div className="space-y-16">
      <div className="grid gap-10 lg:grid-cols-2">
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
              <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                {product.badge}
              </span>
            )}
          </motion.div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setView(i)}
                aria-label={`Вид ${i + 1}`}
                className={cn(
                  "overflow-hidden rounded-2xl border-2 transition-colors cursor-pointer",
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
          <div className="mb-2 flex items-center gap-1.5 text-sm text-faint">
            <span>{product.brand}</span>
            <span>·</span>
            <span>{product.category}</span>
          </div>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
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

          <p className="mt-5 text-muted">{product.short}</p>

          {/* Цена + статус склада */}
          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="font-display text-4xl font-bold text-iri">
              {formatPrice(unitPrice)}
            </span>
            {unitOldPrice && (
              <span className="mb-1 flex items-center gap-2">
                <span className="text-lg text-faint line-through">
                  {formatPrice(unitOldPrice)}
                </span>
                <span className="rounded-full bg-magenta/15 px-2 py-0.5 text-xs font-semibold text-magenta">
                  −{discount}%
                </span>
              </span>
            )}
            <span
              className={cn(
                "mb-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                inStock
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-faint/40 bg-white/5 text-faint",
              )}
            >
              {inStock ? "В наличии" : "Нет в наличии"}
            </span>
          </div>

          {/* Цвет */}
          {product.colors.length > 0 && (
            <div className="mt-7">
              <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-faint">
                Цвет: <span className="text-ink">{color}</span>
                {color && !colorHasStock(product, color) && (
                  <span className="ml-2 normal-case tracking-normal text-faint">
                    · нет в наличии
                  </span>
                )}
              </p>
              <div className="flex gap-2.5">
                {product.colors.map((c) => {
                  const available = colorHasStock(product, c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => selectColor(c.name)}
                      aria-label={
                        available ? c.name : `${c.name} — нет в наличии`
                      }
                      title={available ? c.name : `${c.name}: нет в наличии`}
                      className={cn(
                        "relative grid h-9 w-9 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-bg transition-all cursor-pointer",
                        color === c.name ? "ring-cyan" : "ring-transparent",
                        !available && "opacity-45",
                      )}
                    >
                      <span
                        className="h-7 w-7 rounded-full border border-white/10"
                        style={{ background: c.hex }}
                      />
                      {!available && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 flex items-center justify-center"
                        >
                          <span className="h-px w-8 rotate-45 bg-danger/90" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Память */}
          {product.memory && product.memory.length > 0 && (
            <div className="mt-6">
              <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-faint">
                Память
              </p>
              <div className="flex flex-wrap gap-2">
                {product.memory.map((m) => {
                  const available = memoryAvailableForColor(product, color, m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMemory(m)}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-sm transition-colors cursor-pointer",
                        memory === m
                          ? available
                            ? "border-cyan bg-cyan/10 text-ink"
                            : "border-faint bg-white/5 text-faint"
                          : available
                            ? "border-line text-muted hover:border-white/25"
                            : "border-line/60 text-faint/70 line-through",
                      )}
                    >
                      {m}
                      {!available && (
                        <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide no-underline">
                          нет
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Кол-во + в корзину */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div
              className={cn(
                "flex items-center gap-1 rounded-full border border-line p-1",
                !inStock && "pointer-events-none opacity-40",
              )}
            >
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={!inStock}
                aria-label="Меньше"
                className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-ink cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-medium tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                disabled={!inStock}
                aria-label="Больше"
                className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-ink cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              disabled={!inStock}
              onClick={() => {
                if (!inStock) return;
                void addItem(product, { color, memory, qty });
              }}
              className={cn(
                "flex flex-1 items-center justify-center rounded-full px-6 py-[0.85rem] text-center font-semibold transition-[opacity,filter,transform] duration-200",
                inStock
                  ? "btn-primary"
                  : "cursor-not-allowed border border-[#2a314f] bg-[#1a1f35] text-[#6b7394] shadow-none saturate-0 hover:transform-none",
              )}
              aria-disabled={!inStock}
            >
              {inStock
                ? `В корзину · ${formatPrice(unitPrice * qty)}`
                : "Товар закончился"}
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

          {/* Гарантии */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Truck, t: "Доставка", s: "в день заказа" },
              { icon: ShieldCheck, t: "Гарантия", s: "до 3 лет" },
              { icon: Repeat, t: "Трейд-ин", s: "до 30%" },
            ].map(({ icon: I, t, s }) => (
              <div
                key={t}
                className="glass flex flex-col items-center gap-1 rounded-2xl px-2 py-4 text-center"
              >
                <I size={18} className="text-cyan" />
                <span className="text-sm font-medium">{t}</span>
                <span className="text-xs text-faint">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Особенности */}
      <div>
        <h2 className="mb-6 font-display text-2xl font-bold">Особенности</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {product.specs.map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/15 text-cyan">
                <Check size={16} strokeWidth={2.5} />
              </div>
              <p className="text-xs uppercase tracking-wider text-faint">
                {s.label}
              </p>
              <p className="mt-1 font-medium text-ink">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
