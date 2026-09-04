"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Train,
} from "lucide-react";
import { Logo } from "./Logo";
import { useSiteData } from "./site-data";
import { cn } from "@/lib/utils";
import type { NavCategory } from "@/lib/site-source";

type FooterLink = { label: string; href: string };

/** Только реальные маршруты — без заглушек в каталог. */
const BUYER_LINKS: FooterLink[] = [
  { label: "Личный кабинет", href: "/account" },
  { label: "Избранное", href: "/account?tab=wishlist" },
  { label: "Корзина", href: "/cart" },
];

/** Юридические страницы появятся здесь, когда будут готовы маршруты. */
const LEGAL_LINKS: FooterLink[] = [];

const TRUST = [
  "Оригинальная продукция",
  "Официальная гарантия",
  "Рассрочка 0%",
] as const;

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function mapHref(city: string, address: string, lat: number, lng: number) {
  const query = encodeURIComponent(`${city}, ${address}`);
  return `https://yandex.ru/maps/?ll=${lng}%2C${lat}&z=16&text=${query}`;
}

function brandCatalogHref(name: string, categories: NavCategory[]): string | null {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return null;
  const compact = normalized.replace(/[^a-z0-9а-яё]+/gi, "");
  if (!compact) return null;
  const match = categories.find((c) => {
    const slug = c.slug.toLowerCase();
    const catName = c.name.toLowerCase();
    return (
      slug === normalized.replace(/\s+/g, "-") ||
      catName === normalized ||
      compact.startsWith(slug) ||
      slug.startsWith(compact.slice(0, 6))
    );
  });
  return match ? `/catalog?cat=${match.slug}` : null;
}

function NavSection({
  title,
  children,
  defaultOpen = false,
  collapsible,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  collapsible: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <div>
        <h3 className="mb-4 font-display text-sm font-semibold tracking-wide text-ink">
          {title}
        </h3>
        {children}
      </div>
    );
  }

  return (
    <div className="border-b border-line md:border-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-3 py-3 text-left font-display text-sm font-semibold tracking-wide text-ink cursor-pointer md:mb-4 md:min-h-0 md:cursor-default md:pointer-events-none md:py-0"
      >
        {title}
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-muted transition-transform md:hidden",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <div
        id={id}
        className={cn(
          "overflow-hidden pb-4 md:pb-0",
          !open && "hidden md:block",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function LinkList({ links }: { links: FooterLink[] }) {
  if (links.length === 0) return null;
  return (
    <ul className="space-y-1">
      {links.map((l) => (
        <li key={l.href + l.label}>
          <Link
            href={l.href}
            className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-accent md:min-h-0 md:py-0.5"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  const { store: STORE, partnerBrands, categories } = useSiteData();
  const tel = phoneHref(STORE.phone);
  const maps = mapHref(STORE.city, STORE.address, STORE.mapLat, STORE.mapLng);
  const catalogLinks: FooterLink[] = [
    { label: "Весь каталог", href: "/catalog" },
    ...categories.slice(0, 8).map((c) => ({
      label: c.name,
      href: `/catalog?cat=${c.slug}`,
    })),
  ];

  const hasTelegram = Boolean(STORE.telegram);
  const hasEmail = Boolean(STORE.email);
  const hasPhone = Boolean(STORE.phone?.trim());

  return (
    <footer className="relative mt-28 overflow-hidden border-t border-line bg-bg-2">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none text-center font-display text-[clamp(4rem,18vw,12rem)] font-bold leading-none tracking-tighter text-white/[0.03]"
        aria-hidden
      >
        MAZE
      </div>
      <div className="container-x relative py-16 md:py-20">
        <div className="mb-14 flex flex-col gap-6 border-b border-line pb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow mb-3">MAZE</p>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-semibold uppercase tracking-[0.04em] text-ink">
              Найди свой путь в мире технологий
            </h2>
          </div>
          <Link href="/catalog" className="btn-primary shrink-0">
            Открыть каталог
          </Link>
        </div>
        {/* Primary: бренд + навигация + контакты */}
        <div className="grid min-w-0 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:items-start">
          <div className="min-w-0 space-y-5">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Оригинальная техника, трейд-ин и рассрочка 0%.
            </p>
            <ul className="space-y-2">
              {TRUST.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2 text-xs text-muted"
                >
                  <Check size={14} className="shrink-0 text-accent" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            {STORE.hours ? (
              <p className="flex items-center gap-2 text-xs text-faint">
                <Clock size={14} className="shrink-0 text-accent" aria-hidden />
                Работаем ежедневно · {STORE.hours}
              </p>
            ) : null}

            <div className="border border-line bg-panel p-5">
              <p className="font-display text-sm font-semibold text-ink">
                Нужна помощь?
              </p>
              <p className="mt-1 text-xs text-muted">
                Ответим по телефону или в мессенджере
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {hasPhone ? (
                  <a href={tel} className="btn-primary !px-4 !py-2.5 text-xs">
                    <Phone size={14} />
                    Позвонить
                  </a>
                ) : null}
                {hasTelegram ? (
                  <a
                    href={STORE.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost !px-4 !py-2.5 text-xs"
                  >
                    <MessageCircle size={14} />
                    Telegram
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <NavSection title="Каталог" collapsible defaultOpen={false}>
            <LinkList links={catalogLinks} />
          </NavSection>

          <NavSection title="Покупателям" collapsible defaultOpen={false}>
            <LinkList links={BUYER_LINKS} />
          </NavSection>

          <NavSection title="Контакты" collapsible defaultOpen>
            <ul className="space-y-1">
              {hasPhone ? (
                <li>
                  <a
                    href={tel}
                    className="flex min-h-11 min-w-0 items-center gap-2.5 text-sm font-medium text-ink transition-colors hover:text-accent md:min-h-0"
                  >
                    <Phone size={15} className="shrink-0 text-accent" />
                    <span className="min-w-0 break-words">
                      Позвонить · {STORE.phone}
                    </span>
                  </a>
                </li>
              ) : null}
              {hasEmail ? (
                <li>
                  <a
                    href={`mailto:${STORE.email}`}
                    className="flex min-h-11 min-w-0 items-center gap-2.5 text-sm text-muted transition-colors hover:text-accent md:min-h-0"
                  >
                    <Mail size={15} className="shrink-0 text-accent" />
                    <span className="min-w-0 break-all">
                      Написать · {STORE.email}
                    </span>
                  </a>
                </li>
              ) : null}
              {hasTelegram ? (
                <li>
                  <a
                    href={STORE.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center gap-2.5 text-sm text-muted transition-colors hover:text-accent md:min-h-0"
                  >
                    <MessageCircle size={15} className="shrink-0 text-accent" />
                    Написать в Telegram
                  </a>
                </li>
              ) : null}
              <li>
                <a
                  href={maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-start gap-2.5 text-sm text-muted transition-colors hover:text-accent md:min-h-0"
                >
                  <MapPin size={15} className="mt-0.5 shrink-0 text-accent" />
                  <span>
                    Открыть карту
                    <span className="mt-0.5 block text-xs text-faint">
                      {STORE.city}, {STORE.address}
                    </span>
                  </span>
                  <ExternalLink
                    size={12}
                    className="mt-1 shrink-0 text-faint"
                    aria-hidden
                  />
                </a>
              </li>
              {STORE.metro ? (
                <li className="flex min-h-11 items-center gap-2.5 text-sm text-muted md:min-h-0">
                  <Train size={15} className="shrink-0 text-accent" />
                  {STORE.metro}
                </li>
              ) : null}
            </ul>
          </NavSection>
        </div>

        {/* Бренды */}
        {partnerBrands.length > 0 ? (
          <div className="mt-12 border-t border-line pt-8">
            <p className="eyebrow mb-4 text-center">Наши бренды</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-8">
              {partnerBrands.slice(0, 8).map((b) => {
                const href = brandCatalogHref(b, categories);
                const className =
                  "font-display text-sm tracking-widest text-faint transition-colors hover:text-muted";
                return href ? (
                  <Link key={b} href={href} className={className}>
                    {b}
                  </Link>
                ) : (
                  <span key={b} className={className}>
                    {b}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Secondary: legal + copyright */}
        <div className="mt-10 flex flex-col items-center gap-3 pt-8 text-center text-xs text-faint sm:flex-row sm:justify-between sm:text-left">
          <p>© MAZE</p>
          {LEGAL_LINKS.length > 0 ? (
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex min-h-11 items-center transition-colors hover:text-muted sm:min-h-0"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
