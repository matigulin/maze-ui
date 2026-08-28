"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FLUID_EASE } from "@/shared/lib/motion";
import { cn } from "@/lib/utils";
import { BRAND_HINT_INTERVAL_MS } from "../lib/constants";
import { formatBrandHint } from "../lib/format-brand-hint";

type RotatingBrandHintProps = {
  brands: string[];
  className?: string;
};

/** Короче переход — бренды ближе друг к другу по вертикали */
const SLIDE_OFFSET = "72%";
const SLIDE_DURATION = 0.32;

/**
 * Подсказка в поиске: только названия брендов, листаются сверху вниз.
 */
export function RotatingBrandHint({ brands, className }: RotatingBrandHintProps) {
  const reduce = useReducedMotion();
  const hints = useMemo(
    () => brands.map((b) => formatBrandHint(b)),
    [brands],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (hints.length < 2 || reduce) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % hints.length);
    }, BRAND_HINT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [hints.length, reduce]);

  if (hints.length === 0) {
    return <span className={className}>Каталог…</span>;
  }

  if (reduce || hints.length === 1) {
    return (
      <span className={cn("block truncate", className)}>
        {hints[index] ?? hints[0]}
      </span>
    );
  }

  return (
    <span
      className={cn("relative block h-[1.125rem] w-full overflow-hidden", className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={hints[index]}
          className="absolute inset-x-0 top-0 block truncate whitespace-nowrap leading-[1.125rem]"
          initial={{ y: `-${SLIDE_OFFSET}`, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: SLIDE_OFFSET, opacity: 0 }}
          transition={{ duration: SLIDE_DURATION, ease: FLUID_EASE }}
        >
          {hints[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
