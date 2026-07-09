import { Star, MapPin, Clock, Phone } from "lucide-react";

const REVIEWS = [
  {
    name: "Алексей М.",
    src: "Яндекс",
    text: "Купил iPhone 16 Pro Max — всё чётко, оригинал, чек, гарантия. Ребята помогли с trade-in старого. Доставили в день заказа.",
  },
  {
    name: "Мария К.",
    src: "Avito",
    text: "Брала Dyson Airwrap. Цена — лучшая в городе, плюс подарили чехол. Менеджер не давил, ответил на все вопросы.",
  },
  {
    name: "Денис С.",
    src: "2ГИС",
    text: "PS5 Pro привезли за день. Распаковка под камеру, всё прозрачно. Шоурум на Чайковского — стоит зайти.",
  },
];

export function ReviewsMap() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-10">
        <div className="mb-12 grid items-end gap-6 md:grid-cols-2">
          <div>
            <span className="text-overline text-maze-blue">Отзывы и шоурум</span>
            <h2 className="text-display-lg mt-3 text-maze-black">
              Рейтинг 5,0 на трёх площадках
            </h2>
          </div>
          <p className="text-base text-maze-gray-600 md:justify-self-end md:text-right">
            Загляните к нам на Чайковского, 56 — рядом с метро Чернышевская.
            Покажем, расскажем, дадим потрогать.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="grid gap-4">
            {REVIEWS.map((r) => (
              <article
                key={r.name}
                className="rounded-2xl border border-maze-gray-100 bg-maze-gray-50 p-6 transition hover:border-maze-cyan/40 hover:bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-maze-black text-sm font-semibold text-white">
                      {r.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-maze-black">{r.name}</div>
                      <div className="text-xs text-maze-gray-600">{r.src}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-maze-cyan">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-maze-gray-800">{r.text}</p>
              </article>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-maze-gray-100 bg-maze-navy-deep p-8 text-white lg:p-10">
            <div className="absolute inset-0 opacity-60">
              <MapArt />
            </div>
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-maze-cyan/25 blur-[100px]" />

            <div className="relative">
              <span className="text-overline text-maze-cyan-light">Шоурум · Санкт-Петербург</span>
              <h3 className="text-heading-1 mt-3">ул. Чайковского, 56</h3>

              <ul className="mt-8 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-maze-cyan-light" />
                  <span>Метро Чернышевская · 4 минуты пешком</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={18} className="mt-0.5 shrink-0 text-maze-cyan-light" />
                  <span>Ежедневно с 11:30 до 20:30</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 shrink-0 text-maze-cyan-light" />
                  <a href="tel:+79959114984" className="hover:text-maze-cyan-light">
                    +7 (995) 911-49-84
                  </a>
                </li>
              </ul>

              <a
                href="#contacts"
                className="mt-10 inline-flex h-11 items-center gap-2 rounded-full bg-maze-cyan px-6 text-sm font-semibold text-maze-navy-deep transition hover:bg-maze-cyan-light"
              >
                Построить маршрут
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MapArt() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(108,213,250,0.18)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <path
        d="M0 220 Q120 180 180 230 T400 200"
        stroke="rgba(28,181,224,0.5)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M40 100 Q140 140 220 110 T400 160"
        stroke="rgba(108,213,250,0.3)"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="220" cy="200" r="8" fill="#1cb5e0" />
      <circle cx="220" cy="200" r="18" fill="none" stroke="#1cb5e0" strokeWidth="1.5" opacity="0.6">
        <animate attributeName="r" from="8" to="30" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
