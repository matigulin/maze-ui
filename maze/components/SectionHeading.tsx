"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { SplitText } from "@/shared/ui/split-text";
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
    <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-2.5">
          <SplitText text={eyebrow} mode="chars" trigger="inView" />
        </p>
        <h2 className="font-display text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl">
          <SplitText
            text={title}
            mode="words"
            trigger="inView"
            delay={0.08}
            wordGap="0.32em"
          />
        </h2>
        {subtitle && (
          <p className="mt-2 max-w-xl text-sm text-muted">
            <SplitText
              text={subtitle}
              mode="words"
              trigger="inView"
              delay={0.22}
              wordGap="0.3em"
            />
          </p>
        )}
      </div>
      {href && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.6, ease: FLUID_EASE, delay: 0.15 }}
        >
          <Link
            href={href}
            className="group flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-ink"
          >
            {linkLabel}
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
