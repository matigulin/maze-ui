"use client";

import Link from "next/link";
import { ArrowRight, Repeat, CreditCard } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useModal } from "@/components/modals";
import { CARD_HOVER_GLOW } from "@/shared/config/brand-colors";

/** Цветное пятно в углу — один bordo-оттенок (shared/config). */
function CornerGlow() {
  const size = "26rem";
  const radius = "13rem";
  const corner = "0px";

  return (
    <div
      className="pointer-events-none absolute z-0 rounded-full opacity-0 transition-[opacity,transform] duration-500 group-hover:scale-110 group-hover:opacity-100"
      aria-hidden
      style={{
        width: size,
        height: size,
        top: `calc(${corner} - ${radius})`,
        right: `calc(${corner} - ${radius})`,
        background: CARD_HOVER_GLOW,
      }}
    />
  );
}

export function Promo() {
  const { open } = useModal();
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Reveal>
        <div className="group relative h-full overflow-hidden rounded-3xl border border-line p-8 sm:p-10">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-panel to-bg-2" />
          <CornerGlow />
          <div className="relative z-[1]">
            <Repeat className="mb-5 text-accent" size={28} />
            <h3 className="font-display text-2xl font-bold sm:text-3xl">
              Трейд-ин до 30%
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Обменяй старый гаджет на новый. Оценим за пару минут — доплата станет
              приятным сюрпризом.
            </p>
            <button
              type="button"
              onClick={() => open("tradein")}
              className="btn-primary mt-7 group/btn"
            >
              Рассчитать оценку
              <ArrowRight
                size={18}
                className="transition-transform group-hover/btn:translate-x-1"
              />
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="group relative h-full overflow-hidden rounded-3xl border border-bg-warm/40 p-8 sm:p-10">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-bg-warm to-[#1f1414]" />
          <CornerGlow />
          <div className="relative z-[1]">
            <CreditCard className="mb-5 text-accent" size={28} />
            <h3 className="font-display text-2xl font-bold sm:text-3xl">
              Рассрочка 0%
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Забирай технику сейчас, плати частями. Без переплат, скрытых
              комиссий и лишних документов.
            </p>
            <Link href="/catalog" className="btn-ghost mt-7 group/btn">
              Выбрать технику
              <ArrowRight
                size={18}
                className="text-accent transition-transform group-hover/btn:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
