"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import type { Review } from "@/lib/data";
import { Reveal } from "@/components/Reveal";

export function Testimonials({ reviews }: { reviews: Review[] }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const r = reviews[i];

  const go = (d: number) => {
    setDir(d);
    setI((p) => (p + d + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (reviews.length === 0) return;
    const t = setInterval(() => {
      setDir(1);
      setI((p) => (p + 1) % reviews.length);
    }, 5500);
    return () => clearInterval(t);
  }, [reviews.length]);

  if (!r) return null;

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Reveal className="glass flex flex-col justify-between rounded-3xl p-8">
        <div>
          <p className="eyebrow mb-3">Отзывы</p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Нам доверяют
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Реальные отзывы с Яндекс, 2ГИС и Авито — без фильтров и
            приукрашиваний.
          </p>
        </div>
        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={() => go(-1)}
            aria-label="Предыдущий отзыв"
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition-colors hover:border-bg-warm/50 hover:text-accent cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Следующий отзыв"
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition-colors hover:border-bg-warm/50 hover:text-accent cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
          <div className="ml-2 flex gap-1">
            {reviews.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-6 bg-accent" : "w-1.5 bg-line"
                }`}
              />
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35 }}
            className="glass relative flex h-full min-h-[18rem] flex-col justify-between rounded-3xl p-8"
          >
            <Quote
              size={32}
              className="absolute right-6 top-6 text-accent/20"
              aria-hidden
            />
            <div>
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-base leading-relaxed text-ink/90 sm:text-lg">
                «{r.text}»
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div
                className="grid h-11 w-11 place-items-center rounded-full font-display text-sm font-bold text-white"
                style={{ background: r.hue }}
              >
                {r.initials}
              </div>
              <div>
                <p className="font-medium text-ink">{r.name}</p>
                <p className="text-xs text-muted">{r.product}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </Reveal>
    </div>
  );
}
