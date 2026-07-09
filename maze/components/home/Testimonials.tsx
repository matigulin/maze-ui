"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { reviews } from "@/lib/data";
import { Reveal } from "@/components/Reveal";

export function Testimonials() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const r = reviews[i];

  const go = (d: number) => {
    setDir(d);
    setI((p) => (p + d + reviews.length) % reviews.length);
  };

  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setI((p) => (p + 1) % reviews.length);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      {/* Доверие */}
      <Reveal className="glass flex flex-col justify-between rounded-3xl p-8">
        <div>
          <p className="eyebrow mb-3">Нам доверяют</p>
          <div className="flex items-end gap-3">
            <span className="font-display text-6xl font-bold text-iri">4.9</span>
            <div className="mb-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} size={16} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted">на Яндекс.Маркете</p>
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4">
          {[
            ["12 000+", "клиентов"],
            ["1 200+", "отзывов"],
            ["8 лет", "на рынке"],
            ["99.9%", "оригинал"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-line bg-white/[0.02] p-4">
              <div className="font-display text-xl font-bold text-ink">{v}</div>
              <div className="text-xs text-faint">{l}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Карусель отзывов */}
      <Reveal delay={0.1} className="relative">
        <div className="glass relative flex h-full min-h-[18rem] flex-col justify-between overflow-hidden rounded-3xl p-8">
          <Quote
            size={64}
            className="absolute -right-2 -top-2 text-white/[0.04]"
          />
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={i}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, k) => (
                  <Star key={k} size={15} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="text-lg leading-relaxed text-ink">“{r.text}”</p>
              <div className="mt-6 flex items-center gap-3">
                <span
                  className="grid h-11 w-11 place-items-center rounded-full font-semibold text-[#04121a]"
                  style={{ background: r.hue }}
                >
                  {r.initials}
                </span>
                <div>
                  <div className="text-sm font-semibold text-ink">{r.name}</div>
                  <div className="text-xs text-faint">{r.product}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 mt-8 flex items-center justify-between">
            <div className="flex gap-1.5">
              {reviews.map((_, k) => (
                <button
                  key={k}
                  aria-label={`Отзыв ${k + 1}`}
                  onClick={() => {
                    setDir(k > i ? 1 : -1);
                    setI(k);
                  }}
                  className="h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                  style={{
                    width: k === i ? 22 : 6,
                    background: k === i ? "#35e4f0" : "#2a3157",
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                aria-label="Предыдущий"
                onClick={() => go(-1)}
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-cyan/50 hover:text-ink cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                aria-label="Следующий"
                onClick={() => go(1)}
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-cyan/50 hover:text-ink cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
