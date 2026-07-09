import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { CATEGORIES } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CategoryGrid() {
  return (
    <div className="grid auto-rows-[8.5rem] grid-cols-2 gap-4 md:grid-cols-4">
      {CATEGORIES.map((c, i) => {
        const big = i === 0;
        return (
          <Reveal
            key={c.slug}
            delay={i * 0.05}
            className={cn(big && "col-span-2 row-span-2")}
          >
            <Link
              href={`/catalog?cat=${c.slug}`}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-line p-5 transition-colors duration-300 hover:border-white/25"
              style={{
                background: `linear-gradient(140deg, ${c.tint[0]}22, ${c.tint[1]}14)`,
              }}
            >
              {/* свечение при наведении */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
                style={{ background: c.tint[0] }}
              />
              <div className="flex items-start justify-between">
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
                  className="text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                />
              </div>
              <div>
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
