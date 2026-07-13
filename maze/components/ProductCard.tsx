"use client";

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
import { ProductThumb } from "./ProductThumb";
import { useCart } from "./store";
import { cn, formatPrice } from "@/lib/utils";

const BADGE_STYLE: Record<string, string> = {
  NEW: "bg-cyan/15 text-cyan border-cyan/30",
  HIT: "bg-violet/15 text-violet border-violet/30",
  SALE: "bg-magenta/15 text-magenta border-magenta/30",
};

export function ProductCard({ product }: { product: Product }) {
  const reduce = useReducedMotion();
  const { addItem, toggleWishlist, isWished } = useCart();

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

  const wished = isWished(product.id);
  const inStock = product.inStock !== false;

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce || !inStock) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  const body = (
    <>
      <div className="relative">
        <ProductThumb product={product} className="aspect-square w-full" />
        {!inStock && (
          <div
            className="absolute inset-0 z-[1] flex items-center justify-center rounded-[1.1rem] bg-[#05060e]/60 backdrop-blur-[2px]"
            aria-hidden
          >
            <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink">
              Закончился
            </span>
          </div>
        )}
        {product.badge && (
          <span
            className={cn(
              "absolute left-3 top-3 z-[2] rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
              BADGE_STYLE[product.badge],
            )}
          >
            {product.badge === "SALE" && product.oldPrice
              ? `−${Math.round((1 - product.price / product.oldPrice) * 100)}%`
              : product.badge}
          </span>
        )}
        <button
          type="button"
          aria-label={wished ? "Убрать из избранного" : "В избранное"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute right-3 top-3 z-[2] grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50 cursor-pointer"
        >
          <Heart
            size={16}
            className={cn(
              "transition-colors",
              wished && "fill-magenta text-magenta",
            )}
          />
        </button>
      </div>

      <div className="space-y-2 p-2 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-faint">
          <span>{product.brand}</span>
          <span>·</span>
          <span>{product.category}</span>
        </div>
        <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-medium leading-snug text-ink">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Star size={13} className="fill-gold text-gold" />
          <span className="text-ink">{product.rating.toFixed(1)}</span>
          <span className="text-faint">· {product.reviews} отзывов</span>
        </div>

        <div className="flex items-end justify-between pt-1">
          <div>
            <div
              className={cn(
                "font-display text-lg font-semibold",
                inStock ? "text-ink" : "text-faint",
              )}
            >
              {formatPrice(product.price)}
            </div>
            {product.oldPrice && (
              <div className="text-xs text-faint line-through">
                {formatPrice(product.oldPrice)}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={!inStock}
            aria-label={inStock ? "В корзину" : "Товар закончился"}
            title={inStock ? undefined : "Товар закончился"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!inStock) return;
              void addItem(product);
            }}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full transition-transform",
              inStock
                ? "cursor-pointer bg-gradient-to-br from-cyan to-blue text-[#04121a] shadow-[0_8px_24px_-8px_rgba(53,228,240,0.7)] hover:scale-105 active:scale-95"
                : "cursor-not-allowed border border-[#2a314f] bg-[#1a1f35] text-[#6b7394]",
            )}
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </>
  );

  const shellClass = cn(
    "glass block overflow-hidden rounded-3xl p-3 transition-[border-color,box-shadow,filter,opacity] duration-300",
    inStock
      ? "hover:border-cyan/30 hover:shadow-[0_20px_60px_-24px_rgba(53,228,240,0.5)]"
      : "cursor-not-allowed opacity-65 grayscale-[0.7]",
  );

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        reduce || !inStock
          ? undefined
          : { rotateX: rx, rotateY: ry, transformPerspective: 900 }
      }
      className="group relative"
    >
      {inStock ? (
        <Link href={`/product/${product.slug}`} className={shellClass}>
          {body}
        </Link>
      ) : (
        <div
          className={shellClass}
          aria-disabled="true"
          title="Товар закончился"
        >
          {body}
        </div>
      )}
    </motion.div>
  );
}
