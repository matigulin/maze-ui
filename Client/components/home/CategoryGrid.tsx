import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/Icon";
import { CardIcon } from "@/shared/ui/card-icon";
import type { NavCategory } from "@/lib/site-source";
import { cn } from "@/lib/utils";

export function CategoryGrid({ categories }: { categories: NavCategory[] }) {
  return (
    <div className="grid auto-rows-[9rem] grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[11rem] md:gap-4">
      {categories.map((c, i) => {
        const big = i === 0;
        return (
          <Reveal
            key={c.slug}
            delay={i * 0.04}
            className={cn(big && "col-span-2 row-span-2")}
          >
            <Link
              href={`/catalog?cat=${c.slug}`}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] bg-panel p-5 transition-colors duration-400 hover:bg-bg-warm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent sm:p-6"
            >
              <div className="flex items-start justify-between">
                <CardIcon size={big ? "lg" : "md"}>
                  <Icon name={c.icon} size={big ? 26 : 20} strokeWidth={1.5} />
                </CardIcon>
                <ArrowUpRight
                  size={16}
                  strokeWidth={1.5}
                  className="text-faint transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  aria-hidden
                />
              </div>
              <div>
                <h3
                  className={cn(
                    "font-display font-semibold uppercase tracking-[0.04em] text-ink",
                    big ? "text-3xl" : "text-lg",
                  )}
                >
                  {c.name}
                </h3>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-faint">
                  {c.count} моделей
                </p>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
