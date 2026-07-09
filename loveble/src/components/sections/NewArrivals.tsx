import { ArrowRight } from "lucide-react";
import bg from "@/assets/new-arrivals.jpg";

const ITEMS = [
  { brand: "Apple", name: "iPhone 16 Pro Desert Titanium", price: 119990 },
  { brand: "Samsung", name: "Galaxy Z Fold 6 1TB", price: 174990 },
  { brand: "Sony", name: "WH-1000XM6 Headphones", price: 39990 },
  { brand: "Dyson", name: "Supersonic Nural HD16", price: 49990 },
];

export function NewArrivals() {
  return (
    <section className="relative isolate overflow-hidden bg-maze-black py-20 text-white lg:py-32">
      <img
        src={bg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-maze-black via-maze-black/80 to-maze-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-maze-black" />

      <div className="relative mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-overline text-maze-cyan-light">Новинки</span>
            <h2 className="text-display-lg mt-3 max-w-xl">
              Только что приехало в&nbsp;шоурум
            </h2>
          </div>
          <a
            href="#new"
            className="group inline-flex items-center gap-2 text-sm font-medium text-white"
          >
            Все новинки
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((it, i) => (
            <article
              key={it.name}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition hover:-translate-y-1 hover:border-maze-cyan/60 hover:bg-white/[0.07]"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="mb-12 flex items-center justify-between">
                <span className="text-overline text-white/50">{it.brand}</span>
                <span className="rounded-full bg-maze-cyan/15 px-2 py-0.5 text-[11px] font-medium text-maze-cyan-light">
                  В наличии
                </span>
              </div>
              <h3 className="text-base font-medium leading-snug">{it.name}</h3>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-lg font-semibold tabular-nums">
                  {it.price.toLocaleString("ru-RU")} ₽
                </span>
                <span className="text-sm text-maze-cyan-light transition group-hover:text-white">→</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
