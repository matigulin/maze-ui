"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/data";

type ThumbProduct = Pick<
  Product,
  "tint" | "glyph" | "brand" | "imageUrl" | "name"
>;

/**
 * Фото с API или градиентный плейсхолдер (моки / нет картинки).
 */
export function ProductThumb({
  product,
  className,
  glyphClassName,
  angle = 135,
}: {
  product: ThumbProduct;
  className?: string;
  glyphClassName?: string;
  angle?: number;
}) {
  if (product.imageUrl) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-white/5",
          className,
        )}
      >
        <Image
          src={product.imageUrl}
          alt={product.name ?? product.glyph}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
    );
  }

  const [c1, c2] = product.tint;
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl", className)}
      style={{
        background: `linear-gradient(${angle}deg, ${c1} -10%, ${c2} 115%)`,
      }}
      aria-hidden
    >
      <div
        className="absolute -left-8 -top-10 h-2/3 w-2/3 rounded-full opacity-60 blur-2xl"
        style={{
          background: `radial-gradient(circle, ${c1}, transparent 70%)`,
        }}
      />
      <div
        className="absolute -bottom-12 -right-6 h-2/3 w-2/3 rounded-full opacity-50 blur-2xl"
        style={{
          background: `radial-gradient(circle, ${c2}, transparent 70%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/25" />
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center">
        <span className="font-display text-[0.62rem] uppercase tracking-[0.3em] text-white/55">
          {product.brand}
        </span>
        <span
          className={cn(
            "font-display text-lg font-semibold text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]",
            glyphClassName,
          )}
        >
          {product.glyph}
        </span>
      </div>
    </div>
  );
}
