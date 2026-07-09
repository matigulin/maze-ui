"use client";

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { ArrowRight, ChevronDown, Sparkles, Repeat } from "lucide-react";
import { useModal } from "@/components/modals";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const { open } = useModal();

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), {
    stiffness: 120,
    damping: 20,
  });
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), {
    stiffness: 120,
    damping: 20,
  });
  const tx = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), {
    stiffness: 120,
    damping: 20,
  });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <section
      onMouseMove={onMove}
      className="container-x relative grid min-h-[86vh] grid-cols-1 items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]"
    >
      {/* Левая колонка */}
      <div className="relative z-10 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          <span className="text-xs tracking-wide text-muted">
            Более 12 000 клиентов нашли свой путь
          </span>
        </motion.div>

        <h1 className="font-display font-bold leading-[0.92]">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.05 }}
            className="block text-[clamp(3.5rem,11vw,8rem)] text-iri"
          >
            MAZE
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.18 }}
            className="mt-3 block font-sans text-lg font-medium tracking-tight text-muted sm:text-2xl"
          >
            Найди свой путь в мире технологий
          </motion.span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.3 }}
          className="mt-9 flex flex-wrap gap-3"
        >
          <Link href="/catalog" className="btn-primary group">
            Перейти в каталог
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <button onClick={() => open("tradein")} className="btn-ghost group">
            <Repeat size={17} className="text-cyan" />
            Рассчитать трейд-ин
          </button>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex gap-8"
        >
          {[
            ["4.9", "на Яндекс.Маркете"],
            ["3 года", "гарантия"],
            ["0%", "рассрочка"],
          ].map(([v, l]) => (
            <div key={l}>
              <dt className="font-display text-2xl font-bold text-ink">{v}</dt>
              <dd className="text-xs text-faint">{l}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* Правая колонка — стеклянное устройство */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease, delay: 0.2 }}
        className="relative hidden justify-self-center lg:block"
        style={{ perspective: 1000 }}
      >
        <motion.div
          style={reduce ? undefined : { rotateX: rx, rotateY: ry }}
          className="animate-float"
        >
          {/* свечение за устройством */}
          <div className="absolute inset-0 -z-10 scale-110 rounded-[3rem] bg-[radial-gradient(circle,rgba(53,228,240,0.35),transparent_65%)] blur-2xl" />

          <div className="iri-ring glass-strong relative h-[30rem] w-[16rem] rounded-[2.4rem] p-3 shadow-[0_40px_120px_-30px_rgba(53,228,240,0.5)]">
            {/* «экран» */}
            <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.9rem] bg-gradient-to-b from-[#0b1030] to-[#05060e]">
              <div className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-black/60" />
              {/* сияющий блик, движется с мышью */}
              <motion.div
                style={reduce ? undefined : { x: tx }}
                className="absolute -top-10 left-0 h-40 w-full bg-[radial-gradient(circle,rgba(139,92,246,0.5),transparent_60%)] blur-xl"
              />
              <div className="mt-auto flex flex-col items-center gap-3 p-6 pb-14 text-center">
                <span className="font-display text-3xl font-bold text-iri">
                  MAZE
                </span>
                <span className="text-[11px] tracking-widest text-muted">
                  STORE · 2026
                </span>
                <div className="mt-4 flex items-center gap-1.5 rounded-full border border-line bg-white/5 px-3 py-1.5 text-[11px] text-cyan">
                  <Sparkles size={12} />
                  Liquid Glass Edition
                </div>
              </div>
            </div>
          </div>

          {/* парящие чипы */}
          <motion.div
            style={reduce ? undefined : { x: tx }}
            className="glass absolute -left-10 top-16 rounded-2xl px-3 py-2 text-xs"
          >
            <div className="font-semibold text-ink">iPhone 15 Pro</div>
            <div className="text-cyan">−8% сегодня</div>
          </motion.div>
          <motion.div
            style={reduce ? undefined : { x: tx }}
            className="glass absolute -right-8 bottom-24 rounded-2xl px-3 py-2 text-xs"
          >
            <div className="font-semibold text-ink">Трейд-ин</div>
            <div className="text-magenta">до 30% скидки</div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Индикатор скролла */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-faint md:flex"
      >
        <span className="font-display text-[10px] tracking-[0.3em]">СКРОЛЛ</span>
        <motion.span
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={18} />
        </motion.span>
      </motion.div>
    </section>
  );
}
