"use client";

import Link from "next/link";
import { ArrowRight, Repeat, CreditCard } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useModal } from "@/components/modals";

/** Цветное пятно в углу без filter+transform на одном узле (иначе резкий «квадрат»). */
function CornerGlow({
  center,
  mid,
}: {
  center: string;
  mid: string;
}) {
  const size = "26rem";
  const radius = "13rem";
  const corner = "0px";

  return (
    <div
      className="pointer-events-none absolute z-0 rounded-full transition-transform duration-700 group-hover:scale-110"
      aria-hidden
      style={{
        width: size,
        height: size,
        top: `calc(${corner} - ${radius})`,
        right: `calc(${corner} - ${radius})`,
        background: `radial-gradient(circle at center, ${center} 0%, ${mid} 38%, transparent 72%)`,
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
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(130deg,#0b1a3a,#140b30)]" />
          <CornerGlow
            center="rgba(53, 228, 240, 0.75)"
            mid="rgba(53, 228, 240, 0.35)"
          />
          <div className="relative z-[1]">
            <Repeat className="mb-5 text-cyan" size={28} />
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
        <div className="group relative h-full overflow-hidden rounded-3xl border border-line p-8 sm:p-10">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(130deg,#2a0b2c,#140b30)]" />
          <CornerGlow
            center="rgba(255, 61, 139, 0.75)"
            mid="rgba(255, 61, 139, 0.35)"
          />
          <div className="relative z-[1]">
            <CreditCard className="mb-5 text-magenta" size={28} />
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
                className="text-magenta transition-transform group-hover/btn:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
