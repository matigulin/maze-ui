import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag, User, Menu } from "lucide-react";
import { Logo } from "./Logo";

const NAV: Array<{ label: string; to: string }> = [
  { label: "Каталог", to: "/catalog" },
  { label: "Trade-in", to: "/" },
  { label: "Рассрочка", to: "/" },
  { label: "Контакты", to: "/" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/70 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-6 px-5 lg:h-[72px] lg:px-10">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center" aria-label="MAZE — главная">
            <Logo size={scrolled ? 32 : 36} tone="white" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-white/80 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="relative py-1 transition-colors hover:text-white"
                activeProps={{ className: "text-white" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1 text-white/90">
          <IconBtn label="Поиск"><Search size={18} /></IconBtn>
          <IconBtn label="Избранное" className="hidden sm:inline-flex"><Heart size={18} /></IconBtn>
          <IconBtn label="Профиль" className="hidden sm:inline-flex"><User size={18} /></IconBtn>
          <button
            className="ml-1 hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/15 lg:inline-flex"
          >
            <ShoppingBag size={16} />
            <span>Корзина</span>
            <span className="rounded-full bg-maze-cyan px-1.5 text-[11px] font-semibold text-maze-navy-deep">2</span>
          </button>
          <IconBtn label="Корзина" className="lg:hidden"><ShoppingBag size={18} /></IconBtn>
          <IconBtn label="Меню" className="lg:hidden"><Menu size={18} /></IconBtn>
        </div>
      </div>
    </header>
  );
}

function IconBtn({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 ${className}`}
    >
      {children}
    </button>
  );
}
