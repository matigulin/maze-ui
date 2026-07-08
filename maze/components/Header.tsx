"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  Heart,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { useCart } from "./store";
import { useModal } from "./modals";
import { CATEGORIES, STORE } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Header() {
  const router = useRouter();
  const { count, wishlist, setMiniOpen } = useCart();
  const { open } = useModal();
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const catRef = useRef<HTMLDivElement>(null);

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
    setMobileOpen(false);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-strong border-b border-line"
          : "border-b border-transparent",
      )}
    >
      <div className="container-x flex h-16 items-center gap-3 md:h-[4.5rem] md:gap-5">
        <Logo />

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
                className="glass-strong absolute left-0 top-full mt-2 grid w-[30rem] grid-cols-2 gap-1 rounded-2xl border border-line p-2"
              >
                {CATEGORIES.map((c) => (
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
          className="relative hidden flex-1 lg:block"
        >
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по каталогу…"
            aria-label="Поиск"
            className="w-full rounded-full border border-line bg-white/[0.03] py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-faint outline-none transition-colors focus:border-cyan/60 focus:bg-white/[0.05]"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 md:gap-1.5">
          <IconButton
            label="Избранное"
            badge={wishlist.length}
            href="/account?tab=wishlist"
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
          <IconButton label="Личный кабинет" onClick={() => open("auth")}>
            <User size={19} />
          </IconButton>
          <a
            href={`tel:${STORE.phone.replace(/[^+\d]/g, "")}`}
            className="ml-1 hidden items-center gap-2 rounded-full border border-line px-3 py-2 text-sm text-muted transition-colors hover:border-cyan/50 hover:text-ink xl:flex"
          >
            <Phone size={15} className="text-cyan" />
            {STORE.phone}
          </a>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Меню"
            className="grid h-10 w-10 place-items-center rounded-full text-muted hover:text-ink md:hidden cursor-pointer"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[80] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="glass-strong absolute right-0 top-0 h-full w-[85%] max-w-sm border-l border-line p-5"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Закрыть меню"
                  className="grid h-9 w-9 place-items-center rounded-full text-muted hover:text-ink cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={search} className="relative mb-5">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Поиск…"
                  className="w-full rounded-full border border-line bg-white/[0.03] py-2.5 pl-11 pr-4 text-sm outline-none focus:border-cyan/60"
                />
              </form>
              <nav className="space-y-1">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/catalog?cat=${c.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/5"
                  >
                    <span
                      className="grid h-8 w-8 place-items-center rounded-lg text-white"
                      style={{
                        background: `linear-gradient(135deg, ${c.tint[0]}, ${c.tint[1]})`,
                      }}
                    >
                      <Icon name={c.icon} size={15} />
                    </span>
                    <span className="text-sm font-medium">{c.name}</span>
                  </Link>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
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
  onClick?: () => void;
  href?: string;
}) {
  const cls =
    "relative grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-ink cursor-pointer";
  const inner = (
    <>
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gradient-to-br from-cyan to-blue px-1 text-[10px] font-bold text-[#04121a]">
          {badge}
        </span>
      )}
    </>
  );
  if (href)
    return (
      <Link href={href} aria-label={label} className={cls}>
        {inner}
      </Link>
    );
  return (
    <button onClick={onClick} aria-label={label} className={cls}>
      {inner}
    </button>
  );
}
