"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  Heart,
  Menu,
  Phone,
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
import { useCart } from "./store";
import { useSiteData } from "./site-data";
import { cn } from "@/lib/utils";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { count, wishlist, setMiniOpen } = useCart();
  const { categories, store: STORE, partnerBrands } = useSiteData();
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const catRef = useRef<HTMLDivElement>(null);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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
    router.push(q.trim() ? `/catalog?q=${encodeURIComponent(q.trim())}` : "/catalog");
    closeMobile();
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50",
          scrolled || mobileOpen
            ? "chrome-sticky"
            : "border-b border-transparent bg-transparent transition-[background-color,border-color] duration-200",
        )}
      >
        <div className="container-x flex h-14 min-w-0 shrink-0 flex-nowrap items-center gap-1.5 sm:h-16 sm:gap-3 md:h-[4.5rem] md:gap-5">
          <Logo compact="mobile" className="min-w-0 shrink" />

          {/* Каталог dropdown */}
          <div ref={catRef} className="relative hidden md:block">
            <button
              onClick={() => setCatOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink cursor-pointer"
              aria-expanded={catOpen}
            >
              Каталог
              <ChevronDown
                size={15}
                className={cn("transition-transform", catOpen && "rotate-180")}
              />
            </button>
            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 top-full mt-2 grid w-[30rem] grid-cols-2 gap-1 rounded-2xl border border-line bg-[#0e1126] p-2 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.75)]"
                >
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/catalog?cat=${c.slug}`}
                      onClick={() => setCatOpen(false)}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
                    >
                      <span
                        className="grid h-9 w-9 place-items-center rounded-lg text-white"
                        style={{
                          background: `linear-gradient(135deg, ${c.tint[0]}, ${c.tint[1]})`,
                        }}
                      >
                        <Icon name={c.icon} size={17} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">
                          {c.name}
                        </span>
                        <span className="text-xs text-faint">
                          {c.count} товаров
                        </span>
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Поиск */}
          <form
            onSubmit={search}
            className="hidden flex-1 lg:block"
          >
            <CatalogSearchInput
              value={q}
              onChange={setQ}
              brands={partnerBrands}
            />
          </form>

          <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-0.5 sm:gap-1 md:gap-1.5">
            <IconButton
              label="Избранное"
              badge={wishlist.length}
              href="/account?tab=wishlist"
              onClick={(e) => {
                if (pathname === "/account") {
                  e.preventDefault();
                  window.dispatchEvent(
                    new CustomEvent(ACCOUNT_TAB_EVENT, { detail: "wishlist" }),
                  );
                  router.replace("/account?tab=wishlist");
                  resetWindowScroll();
                }
              }}
            >
              <Heart size={19} />
            </IconButton>
            <IconButton
              label="Корзина"
              badge={count}
              onClick={() => setMiniOpen(true)}
            >
              <ShoppingCart size={19} />
            </IconButton>
            <div className="hidden md:block">
              <HeaderAuthActions />
            </div>
            <a
              href={`tel:${STORE.phone.replace(/[^+\d]/g, "")}`}
              className="ml-1 hidden items-center gap-2 rounded-full border border-line px-3 py-2 text-sm text-muted transition-colors hover:border-cyan/50 hover:text-ink xl:flex"
            >
              <Phone size={15} className="text-cyan" />
              {STORE.phone}
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={mobileOpen}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:text-ink sm:h-10 sm:w-10 md:hidden cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={mobileOpen}
        onClose={closeMobile}
        rootClassName="md:hidden"
        /* Ширина по самой длинной категории («Игровые приставки»), не на весь экран */
        panelClassName="w-[min(100vw-2.75rem,18rem)] max-w-[18rem]"
      >
        <div className="shrink-0 border-b border-line p-5">
          <div className="flex items-center justify-between">
            <Logo compact />
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Закрыть меню"
              className="grid h-9 w-9 place-items-center rounded-full text-muted hover:text-ink cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 pt-4">
          <div className="mb-4">
            <MobileAuthActions onNavigate={closeMobile} />
          </div>
          <form onSubmit={search} className="mb-5">
            <CatalogSearchInput
              value={q}
              onChange={setQ}
              brands={partnerBrands}
            />
          </form>
          <nav className="space-y-1">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/catalog?cat=${c.slug}`}
                onClick={closeMobile}
                className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/5"
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
                  style={{
                    background: `linear-gradient(135deg, ${c.tint[0]}, ${c.tint[1]})`,
                  }}
                >
                  <Icon name={c.icon} size={15} />
                </span>
                <span className="whitespace-nowrap text-sm font-medium">
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
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  href?: string;
}) {
  const cls =
    "relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-ink sm:h-10 sm:w-10 cursor-pointer";
  const inner = (
    <>
      {children}
      {badge != null && badge > 0 && (
        <span className="pointer-events-none absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gradient-to-br from-cyan to-blue px-1 text-[10px] font-bold text-[#04121a]">
          {badge}
        </span>
      )}
    </>
  );
  if (href)
    return (
      <Link
        href={href}
        aria-label={label}
        className={cls}
        onClick={onClick}
      >
        {inner}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {inner}
    </button>
  );
}
