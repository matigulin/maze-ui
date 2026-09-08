"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { FLUID_EASE } from "@/shared/lib/motion";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel = "Смотреть всё",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8 md:mb-14">
      <div className="max-w-2xl">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: FLUID_EASE }}
          className="eyebrow mb-3"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: FLUID_EASE, delay: 0.05 }}
          className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold uppercase leading-[1.1] tracking-[0.04em] text-ink"
        >
          {title}
        </motion.h2>
        {subtitle ? (
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
        >
          {linkLabel}
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}
    </div>
  );
}
