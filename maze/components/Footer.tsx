import Link from "next/link";
import { Heart, MapPin, Phone, Clock, Train } from "lucide-react";
import { Logo } from "./Logo";
import { BRANDS, STORE } from "@/lib/data";

const COLS = [
  {
    title: "Каталог",
    links: ["Apple", "Samsung", "Sony", "Marshall", "Dyson", "Harman Kardon"],
  },
  { title: "О нас", links: ["О компании", "Отзывы", "Б/У техника", "Вакансии"] },
  {
    title: "Помощь",
    links: ["Доставка и оплата", "Гарантия", "Кредит и рассрочка", "Ремонт", "Для юр. лиц"],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-line">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Найди свой путь в мире технологий. Оригинальная техника, трейд-ин
              и рассрочка 0%.
            </p>
            <div className="mt-5 flex gap-2">
              {STORE.socials.map((s) => (
                <a
                  key={s}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-line text-xs font-semibold text-muted transition-colors hover:border-cyan/50 hover:text-cyan cursor-pointer"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 font-display text-sm font-semibold tracking-wide text-ink">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      href="/catalog"
                      className="text-sm text-muted transition-colors hover:text-cyan"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-4 font-display text-sm font-semibold tracking-wide text-ink">
              Контакты
            </h3>
            <ul className="space-y-3 text-sm text-muted">
              <li>
                <a
                  href={`tel:${STORE.phone.replace(/[^+\d]/g, "")}`}
                  className="flex items-center gap-2 font-medium text-ink transition-colors hover:text-cyan"
                >
                  <Phone size={15} className="text-cyan" />
                  {STORE.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-cyan" />
                <span>
                  {STORE.city}, {STORE.address}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Train size={15} className="text-cyan" />
                {STORE.metro}
              </li>
              <li className="flex items-center gap-2">
                <Clock size={15} className="text-cyan" />
                {STORE.hours}
              </li>
            </ul>
          </div>
        </div>

        {/* Партнёры */}
        <div className="mt-12 border-t border-line pt-8">
          <p className="eyebrow mb-4 text-center">Партнёры</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {BRANDS.slice(0, 6).map((b) => (
              <span
                key={b}
                className="font-display text-sm tracking-widest text-faint transition-colors hover:text-muted"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-1 text-center text-xs text-faint">
          <p>© 2026 MAZE. Все права защищены.</p>
          <p className="flex items-center gap-1.5">
            Сделано с
            <Heart size={12} className="fill-magenta text-magenta" />в
            Санкт-Петербурге
          </p>
        </div>
      </div>
    </footer>
  );
}
