"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  Heart,
  Menu,
  ShoppingCart,
  X,
} from "lucide-react";
import { HeaderAuthActions, MobileAuthActions } from "@/features/auth";
import { ACCOUNT_TAB_EVENT } from "@/features/account";
import { CatalogSearchInput } from "@/features/catalog-search";
import { MobileDrawer } from "@/shared/ui/mobile-drawer";
import { resetWindowScroll } from "@/lib/scroll";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { CardIcon } from "@/shared/ui/card-icon";
import { useCart } from "./store";
import { useSiteData } from "./site-data";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/catalog",
    label: "Каталог",
    match: (p: string) => p.startsWith("/catalog") || p.startsWith("/product"),
  },
  { href: "/#reviews", label: "Отзывы", match: () => false },
  {
    href: "/account",
    label: "Кабинет",
    match: (p: string) => p.startsWith("/account"),
  },
] as const;

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { count, wishlist, setMiniOpen } = useCart();
  const { categories, partnerBrands } = useSiteData();
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const catRef = useRef<HTMLDivElement>(null);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 8;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node))
        setCatOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function search(e: React.FormEvent) {
    e.preventDefault();
    router.push(
      q.trim() ? `/catalog?q=${encodeURIComponent(q.trim())}` : "/catalog",
    );
    closeMobile();
  }

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <div className="pointer-events-auto px-3 pt-3 sm:px-4 sm:pt-4 md:px-6">
          <div
            className={cn(
              "nav-pill mx-auto flex h-14 max-w-7xl min-w-0 flex-nowrap items-center gap-1.5 px-3 transition-[background-color,border-color] duration-300 sm:h-16 sm:gap-3 sm:px-5 md:h-[4.25rem] md:gap-5 md:px-6",
              (scrolled || mobileOpen) && "nav-pill-scrolled",
            )}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Открыть меню"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-panel hover:text-white md:hidden cursor-pointer"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>

            <div className="hidden items-center gap-1 md:flex">
              <div ref={catRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCatOpen((v) => !v)}
                  className={cn(
                    "nav-link inline-flex items-center gap-1.5 px-3 py-2 cursor-pointer",
                    catOpen && "nav-link-active",
                  )}
                  aria-expanded={catOpen}
                >
                  Меню
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform",
                      catOpen && "rotate-180",
                    )}
                  />
                </button>
                <AnimatePresence>
                  {catOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.22 }}
                      className="absolute left-0 top-full z-50 mt-3 grid w-[28rem] grid-cols-2 gap-0.5 rounded-2xl border border-line bg-bg-2 p-2 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)]"
                    >
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/catalog?cat=${c.slug}`}
                          onClick={() => setCatOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-panel"
                        >
                          <CardIcon size="sm">
                            <Icon name={c.icon} size={15} strokeWidth={1.5} />
                          </CardIcon>
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-medium tracking-wide text-ink">
                              {c.name}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-faint">
                              {c.count} моделей
                            </span>
                          </span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Logo compact="mobile" className="min-w-0 shrink" />

            <form onSubmit={search} className="hidden min-w-0 flex-1 lg:block">
              <CatalogSearchInput
                value={q}
                onChange={setQ}
                brands={partnerBrands}
                inputClassName="border-white/12 bg-black/20 focus:border-white/35 focus:bg-black/30"
              />
            </form>

            <nav className="hidden items-center gap-1 xl:flex">
              {NAV.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "nav-link px-3 py-2",
                      active && "nav-link-active",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1 lg:ml-0">
              <IconButton
                label="Избранное"
                badge={wishlist.length}
                href="/account?tab=wishlist"
                onClick={(e) => {
                  if (pathname === "/account") {
                    e.preventDefault();
                    window.dispatchEvent(
                      new CustomEvent(ACCOUNT_TAB_EVENT, {
                        detail: "wishlist",
                      }),
                    );
                    router.replace("/account?tab=wishlist");
                    resetWindowScroll();
                  }
                }}
              >
                <Heart size={18} strokeWidth={1.5} />
              </IconButton>
              <IconButton
                label="Корзина"
                badge={count}
                onClick={() => setMiniOpen(true)}
              >
                <ShoppingCart size={18} strokeWidth={1.5} />
              </IconButton>
              <div className="hidden md:block">
                <HeaderAuthActions />
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={mobileOpen}
        onClose={closeMobile}
        rootClassName="md:hidden"
        panelClassName="w-[min(100vw-2.5rem,20rem)] max-w-[20rem] rounded-l-3xl"
        aria-label="Навигация"
      >
        <div className="shrink-0 border-b border-line px-5 py-5">
          <div className="flex items-center justify-between">
            <Logo compact />
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Закрыть меню"
              className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-panel hover:text-ink cursor-pointer"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="mb-6">
            <MobileAuthActions onNavigate={closeMobile} />
          </div>
          <form onSubmit={search} className="mb-8">
            <CatalogSearchInput
              value={q}
              onChange={setQ}
              brands={partnerBrands}
              inputClassName="rounded-full"
            />
          </form>
          <p className="eyebrow mb-3">Навигация</p>
          <nav className="mb-8 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className="block rounded-xl border-b border-line/50 py-3 text-sm tracking-wide text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="eyebrow mb-3">Категории</p>
          <nav className="space-y-1">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/catalog?cat=${c.slug}`}
                onClick={closeMobile}
                className="flex items-center gap-3 rounded-xl py-3 transition-colors hover:bg-panel hover:text-accent"
              >
                <CardIcon size="sm">
                  <Icon name={c.icon} size={14} strokeWidth={1.5} />
                </CardIcon>
                <span className="text-sm font-medium tracking-wide">
                  {c.name}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </MobileDrawer>
    </>
  );
}

function IconButton({
  children,
  label,
  badge,
  onClick,
  href,
}: {
  children: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
  href?: string;
}) {
  const cls =
    "relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-panel hover:text-ink cursor-pointer";
  const inner = (
    <>
      {children}
      {badge != null && badge > 0 && (
        <span className="pointer-events-none absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold tabular-nums text-bg">
          {badge}
        </span>
      )}
    </>
  );
  if (href)
    return (
      <Link href={href} aria-label={label} className={cls} onClick={onClick}>
        {inner}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {inner}
    </button>
  );
}
