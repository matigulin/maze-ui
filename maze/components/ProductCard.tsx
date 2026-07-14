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

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  const wished = isWished(product.id);

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className="group relative"
    >
      <Link
        href={`/product/${product.slug}`}
        className="glass block overflow-hidden rounded-3xl p-3 transition-[border-color,box-shadow] duration-300 hover:border-cyan/30 hover:shadow-[0_20px_60px_-24px_rgba(53,228,240,0.5)]"
      >
        {/* верх: бейдж + сердце */}
        <div className="relative">
          <ProductThumb
            product={product}
            className="aspect-square w-full"
          />
          {product.badge && (
            <span
              className={cn(
                "absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
                BADGE_STYLE[product.badge],
              )}
            >
              {product.badge === "SALE" && product.oldPrice
                ? `−${Math.round((1 - product.price / product.oldPrice) * 100)}%`
                : product.badge}
            </span>
          )}
          <button
            aria-label={wished ? "Убрать из избранного" : "В избранное"}
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50 cursor-pointer"
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

        {/* инфо */}
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
              <div className="font-display text-lg font-semibold text-ink">
                {formatPrice(product.price)}
              </div>
              {product.oldPrice && (
                <div className="text-xs text-faint line-through">
                  {formatPrice(product.oldPrice)}
                </div>
              )}
            </div>
            <button
              aria-label="В корзину"
              onClick={(e) => {
                e.preventDefault();
                void addItem(product);
              }}
              className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cyan to-blue text-[#04121a] shadow-[0_8px_24px_-8px_rgba(53,228,240,0.7)] transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
