"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HERO_NAV_SOLID_OFFSET_PX,
  HERO_SECTION_ID,
} from "../lib/constants";

type Options = {
  /** Например открытое мобильное меню — всегда solid. */
  forceSolid?: boolean;
};

function readPastHero(): boolean {
  const hero = document.getElementById(HERO_SECTION_ID);
  if (!hero) return false;

  // У самого верха главной всегда прозрачный навбар (поверх видео)
  if (window.scrollY < 40) return false;

  return hero.getBoundingClientRect().bottom <= HERO_NAV_SOLID_OFFSET_PX;
}

/**
 * На главной: solid=false, пока секция hero (видео) ещё под навбаром.
 * После конца видео / на других страницах — solid pill.
 */
export function useNavOverHero({ forceSolid = false }: Options = {}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [pastHero, setPastHero] = useState(() => !isHome);

  useEffect(() => {
    if (!isHome) {
      setPastHero(true);
      return;
    }

    setPastHero(false);

    let cancelled = false;
    let raf = 0;
    let io: IntersectionObserver | null = null;

    const apply = (next: boolean) => {
      if (cancelled) return;
      setPastHero((prev) => (prev === next ? prev : next));
    };

    const sync = () => apply(readPastHero());

    const attach = () => {
      if (cancelled) return;
      const hero = document.getElementById(HERO_SECTION_ID);
      if (!hero) {
        raf = window.requestAnimationFrame(attach);
        return;
      }

      sync();

      io = new IntersectionObserver(sync, {
        root: null,
        rootMargin: `-${HERO_NAV_SOLID_OFFSET_PX}px 0px 0px 0px`,
        threshold: [0, 0.01, 0.1, 0.25, 0.5, 1],
      });
      io.observe(hero);

      window.addEventListener("scroll", sync, { passive: true });
      window.addEventListener("resize", sync);
    };

    attach();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      io?.disconnect();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [isHome]);

  return forceSolid || pastHero;
}
