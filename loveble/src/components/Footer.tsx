import { Logo } from "./Logo";
import { Instagram, Send, MessageCircle } from "lucide-react";

const COLS = [
  {
    title: "Каталог",
    items: ["Apple", "Samsung", "Dyson", "PlayStation", "Marshall", "Harman/Kardon"],
  },
  {
    title: "Покупателям",
    items: ["Доставка и оплата", "Trade-in", "Гарантия", "Рассрочка", "Ремонт", "Для юрлиц"],
  },
  {
    title: "Компания",
    items: ["О нас", "Отзывы", "Б/У техника", "Контакты", "Вакансии", "Политика"],
  },
];

export function Footer() {
  return (
    <footer className="bg-maze-black text-white">
      <div className="mx-auto max-w-[1320px] px-5 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr_1fr]">
          <div>
            <Logo size={44} tone="white" />
            <p className="mt-5 max-w-xs text-sm text-white/60">
              Премиальная техника и сервис в Санкт-Петербурге. Доставка по всей России.
            </p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Send, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-maze-cyan hover:text-maze-cyan"
                  aria-label="Соцсеть"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLS.map((c) => (
              <div key={c.title}>
                <div className="text-overline mb-4 text-white/50">{c.title}</div>
                <ul className="space-y-2.5 text-sm">
                  {c.items.map((it) => (
                    <li key={it}>
                      <a href="#" className="text-white/75 transition hover:text-white">
                        {it}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <div className="text-overline mb-4 text-white/50">Контакты</div>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <a href="tel:+79959114984" className="text-base font-semibold text-white hover:text-maze-cyan-light">
                  +7 (995) 911-49-84
                </a>
              </li>
              <li>ул. Чайковского, 56</li>
              <li>метро Чернышевская</li>
              <li>11:30 — 20:30 ежедневно</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50">
          <span>© MAZE 2026 · Все права защищены</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Политика</a>
            <a href="#" className="hover:text-white">Оферта</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
