"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Repeat } from "lucide-react";
import { useModal } from "@/components/modals";
import { FLUID_EASE } from "@/shared/lib/motion";
import { SplitText } from "@/shared/ui/split-text";
import { HERO_COPY } from "../lib/constants";
import { HeroVideoBackground } from "./HeroVideoBackground";

export function HomeHero() {
  const { open } = useModal();

  return (
    <section className="relative min-h-[min(92vh,920px)] w-full overflow-hidden">
      <HeroVideoBackground />

      <div className="container-x relative z-10 flex min-h-[min(92vh,920px)] flex-col justify-center py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: FLUID_EASE }}
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-line/80 bg-panel/40 px-3.5 py-1.5 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="text-xs tracking-wide text-muted">
            {HERO_COPY.badge}
          </span>
        </motion.div>

        <h1 className="max-w-3xl font-display font-bold leading-[1.08]">
          <SplitText
            text={HERO_COPY.title}
            mode="chars"
            delay={0.06}
            className="block text-[clamp(3.25rem,12vw,7.5rem)] tracking-[0.06em] text-accent"
          />
          <SplitText
            text={HERO_COPY.subtitle}
            mode="words"
            delay={0.38}
            className="mt-4 block font-sans text-lg font-normal leading-snug tracking-tight text-ink/90 sm:text-2xl"
          />
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: FLUID_EASE, delay: 1.05 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Link href="/catalog" className="btn-primary group">
            Перейти в каталог
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <button type="button" onClick={() => open("tradein")} className="btn-ghost group">
            <Repeat size={17} className="text-accent" />
            Рассчитать трейд-ин
          </button>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-14 flex flex-wrap gap-8 sm:gap-12"
        >
          {HERO_COPY.stats.map(([v, l]) => (
            <div key={l}>
              <dt className="font-display text-2xl font-bold text-accent">{v}</dt>
              <dd className="text-xs text-faint">{l}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
