"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { Heart, Plus, Star } from "lucide-react";
import type { Product } from "@/lib/data";
import { formatStockCompact, isProductInStock } from "@/entities/product";
import { ProductThumb } from "./ProductThumb";
import { useCart } from "./store";
import { cn, formatPrice } from "@/lib/utils";
import { formatStockLabel } from "@/lib/stock";

const BADGE_STYLE: Record<string, string> = {
  NEW: "bg-cyan/15 text-cyan border-cyan/30",
  HIT: "bg-violet/15 text-violet border-violet/30",
  SALE: "bg-magenta/15 text-magenta border-magenta/30",
};

/**
 * Паттерн витрины (catalog / home / account / PDP).
 * Адаптив по ширине сетки (2 колонки), без сжатия типографики.
 */
export function ProductCard({ product }: { product: Product }) {
  const reduce = useReducedMotion();
  const { addItem, toggleWishlist, isWished } = useCart();
  const [tiltOk, setTiltOk] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 200,
    damping: 18,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), {
    stiffness: 200,
    damping: 18,
  });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine) and (min-width: 768px)");
    const sync = () => setTiltOk(fine.matches && !reduce);
    sync();
    fine.addEventListener("change", sync);
    return () => fine.removeEventListener("change", sync);
  }, [reduce]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!tiltOk) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  const wished = isWished(product.id);
  const salePct =
    product.badge === "SALE" && product.oldPrice
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;
  const inStock = isProductInStock(product);
  const meta =
    product.brand && product.category && product.brand !== product.category
      ? `${product.brand} · ${product.category}`
      : product.brand || product.category;

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        tiltOk
          ? { rotateX: rx, rotateY: ry, transformPerspective: 900 }
          : undefined
      }
      className="group relative h-full w-full max-w-full min-w-0"
    >
      <Link
        href={`/product/${product.slug}`}
        className="glass flex h-full min-w-0 flex-col overflow-hidden rounded-2xl p-2 transition-[border-color,box-shadow] duration-300 hover:border-cyan/30 hover:shadow-[0_20px_60px_-24px_rgba(53,228,240,0.5)] sm:rounded-3xl sm:p-3"
      >
        <div className="relative shrink-0">
          <ProductThumb product={product} className="aspect-square w-full" />
          {product.badge ? (
            <span
              className={cn(
                "absolute left-2 top-2 max-w-[calc(100%-3.25rem)] truncate rounded-full border px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-md sm:left-3 sm:top-3 sm:max-w-none sm:px-2.5 sm:py-1 sm:text-[11px]",
                BADGE_STYLE[product.badge],
              )}
            >
              {salePct != null ? `−${salePct}%` : product.badge}
            </span>
          ) : null}
          <button
            type="button"
            aria-label={wished ? "Убрать из избранного" : "В избранное"}
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/50 cursor-pointer sm:right-3 sm:top-3 sm:h-9 sm:w-9"
          >
            <Heart
              size={15}
              className={cn(
                "transition-colors sm:size-4",
                wished && "fill-magenta text-magenta",
              )}
            />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col space-y-1.5 p-1.5 pt-3 sm:space-y-2 sm:p-2 sm:pt-4">
          <p
            className="min-w-0 truncate text-[10px] leading-tight text-faint sm:text-xs"
            title={meta}
          >
            {meta}
          </p>
          <h3 className="line-clamp-2 min-h-[2.4rem] break-words text-[13px] font-medium leading-snug text-ink sm:min-h-[2.6rem] sm:text-sm">
            {product.name}
          </h3>
          <div className="flex min-w-0 items-center gap-1.5 text-[11px] sm:gap-2 sm:text-xs">
            <span className="inline-flex shrink-0 items-center gap-0.5 text-muted">
              <Star
                size={12}
                className="shrink-0 fill-gold text-gold sm:size-[13px]"
              />
              <span className="text-ink">{product.rating.toFixed(1)}</span>
            </span>
            <span
              className={cn(
                "min-w-0 truncate",
                inStock ? "text-cyan" : "text-faint",
              )}
              title={formatStockLabel(product.quantityAvailable)}
            >
              <span className="sm:hidden">
                {formatStockCompact(product.quantityAvailable)}
              </span>
              <span className="hidden sm:inline">
                {formatStockLabel(product.quantityAvailable)}
              </span>
            </span>
          </div>

          <div className="mt-auto flex min-w-0 items-end justify-between gap-2 pt-1">
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="font-display text-[15px] font-semibold leading-tight tabular-nums text-ink [overflow-wrap:anywhere] sm:text-lg">
                {formatPrice(product.price)}
              </div>
              {product.oldPrice ? (
                <div className="truncate text-[10px] text-faint line-through sm:text-xs">
                  {formatPrice(product.oldPrice)}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              disabled={!inStock}
              aria-label={inStock ? "В корзину" : "Нет в наличии"}
              onClick={(e) => {
                e.preventDefault();
                if (!inStock) return;
                void addItem(product);
              }}
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform sm:h-10 sm:w-10",
                inStock
                  ? "cursor-pointer bg-gradient-to-br from-cyan to-blue text-[#04121a] shadow-[0_8px_24px_-8px_rgba(53,228,240,0.7)] hover:scale-105 active:scale-95"
                  : "cursor-not-allowed border border-line bg-white/[0.06] text-faint",
              )}
            >
              <Plus size={17} strokeWidth={2.5} className="sm:size-[18px]" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
