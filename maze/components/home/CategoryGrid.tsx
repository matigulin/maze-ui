import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import type { NavCategory } from "@/lib/site-source";
import { cn } from "@/lib/utils";

/** Стрелка ~18px в углу с padding p-5 → центр ≈ 1.25rem + 9px от краёв. */
const ARROW_CENTER = "calc(1.25rem + 9px)";
const GLOW_SIZE = "22rem";
const GLOW_RADIUS = "11rem";

export function CategoryGrid({ categories }: { categories: NavCategory[] }) {
  return (
    <div className="grid auto-rows-[8.5rem] grid-cols-2 gap-4 md:grid-cols-4">
      {categories.map((c, i) => {
        const big = i === 0;
        return (
          <Reveal
            key={c.slug}
            delay={i * 0.05}
            className={cn(big && "col-span-2 row-span-2")}
          >
            <Link
              href={`/catalog?cat=${c.slug}`}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-line p-5 transition-[border-color,box-shadow] duration-300 hover:border-white/20 hover:shadow-[0_18px_48px_-30px_rgba(53,228,240,0.28)] focus-visible:border-cyan/45 focus-visible:outline-none"
              style={{
                background: `linear-gradient(140deg, ${c.tint[0]}22, ${c.tint[1]}14)`,
              }}
            >
              {/* Центр круга = центр стрелки → часть glow выходит за край карточки */}
              <div
                className="pointer-events-none absolute z-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden
                style={{
                  width: GLOW_SIZE,
                  height: GLOW_SIZE,
                  top: `calc(${ARROW_CENTER} - ${GLOW_RADIUS})`,
                  right: `calc(${ARROW_CENTER} - ${GLOW_RADIUS})`,
                  background: `radial-gradient(circle at center, ${c.tint[0]}cc 0%, ${c.tint[0]}66 32%, ${c.tint[0]}28 52%, transparent 72%)`,
                }}
              />

              <div className="relative z-[1] flex items-start justify-between">
                <span
                  className={cn(
                    "grid place-items-center rounded-2xl text-white shadow-lg",
                    big ? "h-16 w-16" : "h-11 w-11",
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${c.tint[0]}, ${c.tint[1]})`,
                  }}
                >
                  <Icon name={c.icon} size={big ? 30 : 20} />
                </span>
                <ArrowUpRight
                  size={18}
                  className="shrink-0 text-muted transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  aria-hidden
                />
              </div>

              <div className="relative z-[1]">
                <h3
                  className={cn(
                    "font-display font-semibold text-ink",
                    big ? "text-2xl" : "text-base",
                  )}
                >
                  {c.name}
                </h3>
                <p className="text-xs text-muted">{c.count} товаров</p>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
