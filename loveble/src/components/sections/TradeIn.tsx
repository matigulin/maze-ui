import { ArrowUpRight } from "lucide-react";

export function TradeIn() {
  return (
    <section id="tradein" className="relative overflow-hidden bg-maze-gray-50 py-20 lg:py-28">
      <div className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-maze-cyan/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-[420px] w-[420px] rounded-full bg-maze-royal/20 blur-[140px]" />

      <div className="relative mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="grid items-center gap-12 rounded-3xl border border-maze-gray-100 bg-white/70 p-8 backdrop-blur md:grid-cols-[1.2fr_1fr] md:p-12 lg:p-16">
          <div>
            <span className="text-overline text-maze-cyan">Trade-in</span>
            <h2 className="text-display-lg mt-3 text-maze-black">
              Сдай старое — забери&nbsp;новое со&nbsp;скидкой
            </h2>
            <p className="mt-5 max-w-md text-base text-maze-gray-600">
              Оценим iPhone, Samsung, MacBook, Apple Watch и игровые приставки за
              5 минут. Без скрытых комиссий, чек и договор на руки.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button className="group inline-flex h-12 items-center gap-2 rounded-full bg-maze-black px-7 text-[15px] font-semibold text-white transition hover:bg-maze-navy-deep">
                Рассчитать стоимость
                <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
              <span className="text-sm text-maze-gray-600">
                или позвоните <a href="tel:+79959114984" className="font-medium text-maze-black underline-offset-4 hover:underline">+7 (995) 911-49-84</a>
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-3 text-center">
              {[
                { v: "до 70%", l: "от цены устройства" },
                { v: "5 мин", l: "оценка онлайн" },
                { v: "0 ₽", l: "комиссия за услугу" },
                { v: "8 000+", l: "успешных сделок" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl border border-maze-gray-100 bg-white p-5"
                >
                  <div className="text-heading-1 maze-wordmark-gradient tabular-nums">
                    {s.v}
                  </div>
                  <div className="mt-1 text-xs text-maze-gray-600">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
