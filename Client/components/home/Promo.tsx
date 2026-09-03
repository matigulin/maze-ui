"use client";

import Link from "next/link";
import { ArrowRight, Repeat, CreditCard } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CardIcon } from "@/shared/ui/card-icon";
import { useModal } from "@/components/modals";

export function Promo() {
  const { open } = useModal();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Reveal>
        <div className="relative h-full overflow-hidden rounded-[1.75rem] bg-panel px-8 py-12 sm:px-10 sm:py-14">
          <p className="eyebrow mb-6">Trade-in</p>
          <CardIcon className="mb-5">
            <Repeat size={22} strokeWidth={1.5} />
          </CardIcon>
          <h3 className="font-display text-3xl font-semibold uppercase tracking-[0.04em] text-ink sm:text-4xl">
            Трейд-ин до 30%
          </h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Обменяй старый гаджет на новый. Оценка за пару минут — доплата станет
            приятным сюрпризом.
          </p>
          <button
            type="button"
            onClick={() => open("tradein")}
            className="btn-primary mt-8"
          >
            Рассчитать
            <ArrowRight size={14} />
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="relative h-full overflow-hidden rounded-[1.75rem] bg-panel px-8 py-12 sm:px-10 sm:py-14">
          <p className="eyebrow mb-6">Finance</p>
          <CardIcon className="mb-5">
            <CreditCard size={22} strokeWidth={1.5} />
          </CardIcon>
          <h3 className="font-display text-3xl font-semibold uppercase tracking-[0.04em] text-ink sm:text-4xl">
            Рассрочка 0%
          </h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Забирай технику сейчас, плати частями. Без переплат и скрытых
            комиссий.
          </p>
          <Link href="/catalog" className="btn-ghost mt-8">
            Выбрать
            <ArrowRight size={14} />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
