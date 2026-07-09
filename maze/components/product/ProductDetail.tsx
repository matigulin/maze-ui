"use client";

import Link from "next/link";
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
import type { Product } from "@/lib/data";
import { ProductThumb } from "@/components/ProductThumb";
import { useCart } from "@/components/store";
import { formatPrice, cn } from "@/lib/utils";

const ANGLES = [135, 90, 200, 45];

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, toggleWishlist, isWished } = useCart();
  const [view, setView] = useState(0);
  const [color, setColor] = useState(product.colors[0]?.name);
  const [memory, setMemory] = useState(product.memory?.[0]);
  const [qty, setQty] = useState(1);
  const wished = isWished(product.id);
  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : [null, null, null, null];

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

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

          {/* Цена */}
          <div className="mt-6 flex items-end gap-3">
            <span className="font-display text-4xl font-bold text-iri">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="mb-1 flex items-center gap-2">
                <span className="text-lg text-faint line-through">
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="rounded-full bg-magenta/15 px-2 py-0.5 text-xs font-semibold text-magenta">
                  −{discount}%
                </span>
              </span>
            )}
          </div>

          {/* Цвет */}
          {product.colors.length > 0 && (
            <div className="mt-7">
              <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-faint">
                Цвет: <span className="text-ink">{color}</span>
              </p>
              <div className="flex gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
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

          {/* Память */}
          {product.memory && product.memory.length > 0 && (
            <div className="mt-6">
              <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-faint">
                Память
              </p>
              <div className="flex flex-wrap gap-2">
                {product.memory.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMemory(m)}
                    className={cn(
                      "rounded-xl border px-4 py-2 text-sm transition-colors cursor-pointer",
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

          {/* Кол-во + в корзину */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-line p-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Меньше"
                className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-ink cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-medium tabular-nums">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                aria-label="Больше"
                className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-ink cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={() => void addItem(product, { color, memory, qty })}
              className="btn-primary flex-1"
            >
              В корзину · {formatPrice(product.price * qty)}
            </button>

            <button
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
