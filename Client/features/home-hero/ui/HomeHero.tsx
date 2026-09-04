"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Repeat } from "lucide-react";
import { useModal } from "@/components/modals";
import { FLUID_EASE } from "@/shared/lib/motion";
import { HERO_COPY, HERO_SECTION_ID } from "../lib/constants";
import { HeroVideoBackground } from "./HeroVideoBackground";

export function HomeHero() {
  const { open } = useModal();

  return (
    <section
      id={HERO_SECTION_ID}
      className="relative -mt-[4.75rem] min-h-[min(100svh,920px)] w-full overflow-hidden sm:-mt-[5.5rem] md:-mt-[5.75rem]"
    >
      <HeroVideoBackground />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50"
        aria-hidden
      />

      <div className="container-x relative z-10 flex min-h-[min(100svh,920px)] flex-col justify-end pb-16 pt-28 sm:justify-center sm:pb-24 sm:pt-32 md:pb-28">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: FLUID_EASE }}
          className="eyebrow mb-6 max-w-md"
        >
          {HERO_COPY.badge}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: FLUID_EASE, delay: 0.08 }}
          className="max-w-4xl"
        >
          <span className="block font-display text-[clamp(3.25rem,12vw,7rem)] font-semibold uppercase leading-[0.92] tracking-[0.04em] text-ink">
            {HERO_COPY.title}
          </span>
          <span className="mt-6 block max-w-lg text-sm font-normal uppercase leading-relaxed tracking-[0.14em] text-muted sm:text-base">
            {HERO_COPY.subtitle}{" "}
            <span className="text-accent">{HERO_COPY.subtitleAccent}</span>
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: FLUID_EASE, delay: 0.28 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Link href="/catalog" className="btn-primary group">
            Каталог
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <button
            type="button"
            onClick={() => open("tradein")}
            className="btn-ghost group"
          >
            <Repeat size={13} />
            Трейд-ин
          </button>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 pt-2"
          aria-label="Быстрые разделы"
        >
          {HERO_COPY.quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[10px] font-medium uppercase tracking-[0.24em] text-muted transition-colors hover:text-accent"
            >
              + {item.label}
            </Link>
          ))}
        </motion.nav>
      </div>
    </section>
  );
}
