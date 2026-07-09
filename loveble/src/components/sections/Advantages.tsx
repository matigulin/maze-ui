import { Truck, Repeat, ShieldCheck, Award } from "lucide-react";

const ITEMS = [
  {
    icon: Truck,
    title: "Быстрая доставка",
    desc: "По СПб в день заказа от 500 ₽. По РФ — СДЭК и Яндекс.",
  },
  {
    icon: Repeat,
    title: "Trade-in",
    desc: "Принимаем любые устройства. Оценка за 5 минут.",
  },
  {
    icon: ShieldCheck,
    title: "Гарантия 12 мес.",
    desc: "Только оригинальная техника. Поддержка после покупки.",
  },
  {
    icon: Award,
    title: "Доверие 10 000+",
    desc: "5★ на Avito, Яндекс и 2ГИС. Шоурум на Чайковского, 56.",
  },
];

export function Advantages() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <span className="text-overline text-maze-blue">Почему MAZE</span>
            <h2 className="text-display-lg mt-3 max-w-xl text-maze-black">
              Сервис, который ощущается как личный консьерж по технике
            </h2>
          </div>
          <a
            href="#about"
            className="hidden text-sm font-medium text-maze-blue transition hover:text-maze-cyan lg:inline-flex"
          >
            О компании →
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((it) => {
            const Icon = it.icon;
            return (
              <article
                key={it.title}
                className="group relative overflow-hidden rounded-2xl border border-maze-gray-100 bg-maze-gray-50 p-6 transition hover:border-maze-cyan/40 hover:bg-white hover:shadow-[0_8px_32px_rgba(0,0,70,0.08)]"
              >
                <span className="mb-12 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-maze-navy shadow-sm transition group-hover:bg-maze-cyan group-hover:text-white">
                  <Icon size={20} />
                </span>
                <h3 className="text-heading-2 mb-2 text-maze-black">{it.title}</h3>
                <p className="text-sm leading-relaxed text-maze-gray-600">{it.desc}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
