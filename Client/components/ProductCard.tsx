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
import { formatStockCompact, canAddMoreFromCard } from "@/entities/product";
import { ProductThumb } from "./ProductThumb";
import { useCart } from "./store";
import { cn, formatPrice } from "@/lib/utils";
import { formatStockLabel } from "@/lib/stock";

/**
 * Premium product showcase — cinematic, minimal chrome.
 * Кнопки избранного/корзины вне Link (a11y: без вложенных interactive).
 */
export function ProductCard({ product }: { product: Product }) {
  const reduce = useReducedMotion();
  const { addItem, toggleWishlist, isWished, items } = useCart();
  const [tiltOk, setTiltOk] = useState(false);
  const href = `/product/${product.slug}`;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), {
    stiffness: 200,
    damping: 20,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), {
    stiffness: 200,
    damping: 20,
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
  const cartQty = items
    .filter(
      (i) => i.product.id === product.id || i.product.slug === product.slug,
    )
    .reduce((sum, i) => sum + i.qty, 0);
  const canAdd = canAddMoreFromCard(product, cartQty);
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
      <div className="product-showcase flex h-full min-w-0 flex-col overflow-hidden transition-transform duration-500">
        <div className="relative shrink-0 overflow-hidden">
          <Link href={href} className="block transition-transform duration-500 ease-out group-hover:scale-[1.04]">
            <ProductThumb
              product={product}
              className="aspect-[4/5] w-full sm:aspect-square"
            />
          </Link>
          {product.badge || salePct != null ? (
            <span className="pointer-events-none absolute left-3 top-3 text-[10px] font-medium uppercase tracking-[0.18em] text-ink">
              {salePct != null ? `−${salePct}%` : product.badge}
            </span>
          ) : null}
          <button
            type="button"
            aria-label={wished ? "Убрать из избранного" : "В избранное"}
            onClick={() => toggleWishlist(product.id)}
            className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-bg-2 text-ink transition-colors hover:bg-panel cursor-pointer"
          >
            <Heart
              size={15}
              strokeWidth={1.5}
              className={cn(wished && "fill-ink text-ink")}
            />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:p-5">
          <Link href={href} className="min-w-0 space-y-2">
            <p
              className="truncate text-[10px] uppercase tracking-[0.2em] text-faint"
              title={meta}
            >
              {meta}
            </p>
            <h3 className="line-clamp-2 min-h-[2.75rem] font-display text-base font-semibold uppercase leading-snug tracking-[0.04em] text-ink sm:text-lg">
              {product.name}
            </h3>
            <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1">
                <Star size={11} className="fill-accent text-accent" />
                {product.rating.toFixed(1)}
              </span>
              <span className="text-line">|</span>
              <span
                className={cn(
                  "min-w-0 truncate",
                  (product.quantityAvailable ?? 0) > 0
                    ? "text-muted"
                    : "text-faint",
                )}
              >
                <span className="sm:hidden">
                  {formatStockCompact(product.quantityAvailable)}
                </span>
                <span className="hidden sm:inline">
                  {formatStockLabel(product.quantityAvailable)}
                </span>
              </span>
            </div>
          </Link>

          <div className="mt-auto flex min-w-0 items-end justify-between gap-3 pt-4">
            <Link href={href} className="min-w-0">
              <div className="font-display text-xl font-semibold tabular-nums tracking-tight text-ink sm:text-2xl">
                {formatPrice(product.price)}
              </div>
              {product.oldPrice ? (
                <div className="text-xs text-faint line-through">
                  {formatPrice(product.oldPrice)}
                </div>
              ) : null}
            </Link>
            <button
              type="button"
              disabled={!canAdd}
              aria-label={
                canAdd
                  ? "В корзину"
                  : cartQty > 0
                    ? "В корзине максимум по остатку"
                    : "Нет в наличии"
              }
              onClick={() => {
                if (!canAdd) return;
                void addItem(product);
              }}
              className={cn(
                "relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all duration-300",
                canAdd
                  ? "cursor-pointer border-[1.5px] border-[#1a221f] bg-accent text-bg opacity-95 hover:opacity-100 group-hover:opacity-100"
                  : "cursor-not-allowed border border-line text-faint opacity-40",
              )}
            >
              <Plus size={16} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
