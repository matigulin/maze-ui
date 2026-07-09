import { ArrowUpRight } from "lucide-react";

const TILES = [
  {
    span: "md:col-span-2 md:row-span-2",
    title: "Apple вселенная",
    sub: "iPhone, MacBook, Watch, AirPods — одна экосистема",
    cta: "Смотреть",
    bg: "linear-gradient(135deg, #0a0a0a, #1c1c1e)",
    accent: "#1cb5e0",
  },
  {
    title: "Dyson Beauty",
    sub: "Airwrap, Supersonic, Corrale",
    cta: "В каталог",
    bg: "linear-gradient(135deg, #1488cc, #2b32b2)",
    accent: "#6dd5fa",
  },
  {
    title: "PlayStation 5 Pro",
    sub: "В наличии · Доставка завтра",
    cta: "Купить",
    bg: "linear-gradient(135deg, #000046, #041759)",
    accent: "#1cb5e0",
  },
  {
    span: "md:col-span-2",
    title: "Marshall × Harman",
    sub: "Аудио, которое слышно",
    cta: "Послушать",
    bg: "linear-gradient(120deg, #1a1a1a, #2980b9)",
    accent: "#6dd5fa",
  },
];

export function MixedGrid() {
  return (
    <section className="bg-white pb-20 lg:pb-28">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <span className="text-overline text-maze-blue">Подборки</span>
            <h2 className="text-display-lg mt-3 text-maze-black">Бренды и&nbsp;коллекции</h2>
          </div>
        </div>

        <div className="grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[260px] lg:auto-rows-[280px]">
          {TILES.map((t) => (
            <article
              key={t.title}
              className={`group relative isolate overflow-hidden rounded-2xl ${t.span ?? ""}`}
              style={{ backgroundImage: t.bg }}
            >
              <div
                className="absolute inset-0 opacity-50 transition-opacity duration-700 group-hover:opacity-80"
                style={{
                  backgroundImage: `radial-gradient(circle at 80% 20%, ${t.accent}55, transparent 55%)`,
                }}
              />
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full border border-white/5" />

              <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white lg:p-7">
                <span className="text-overline text-white/60">MAZE select</span>
                <div>
                  <h3 className="text-heading-1 max-w-[14ch]">{t.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{t.sub}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white transition-transform group-hover:translate-x-1">
                    {t.cta}
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
