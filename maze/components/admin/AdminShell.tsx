"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Layers,
  Package,
  ImageIcon,
  PanelsTopLeft,
  FileText,
  Settings,
  Warehouse,
  LogOut,
  ExternalLink,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStaffAuth } from "@/components/staff/StaffAuthProvider";
import {
  OrdersCountBadge,
  usePendingOrdersCount,
} from "@/features/admin-orders";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingBag },
  { href: "/admin/catalog/categories", label: "Категории", icon: Layers },
  { href: "/admin/catalog/products", label: "Товары", icon: Package },
  { href: "/admin/content/banners", label: "Баннеры", icon: ImageIcon },
  { href: "/admin/content/slides", label: "Слайды", icon: PanelsTopLeft },
  { href: "/admin/content/cms", label: "CMS", icon: FileText },
  { href: "/admin/stock", label: "Склад", icon: Warehouse },
  { href: "/admin/settings/site", label: "Настройки", icon: Settings },
  { href: "/admin/settings/editor-choice", label: "Выбор редакции", icon: PanelsTopLeft },
];

function AdminNav({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { displayName, staff, logout } = useStaffAuth();
  const router = useRouter();
  const { count: pendingOrdersCount } = usePendingOrdersCount();

  async function onLogout() {
    await logout();
    onNavigate?.();
    router.replace("/staff/login");
  }

  return (
    <>
      <div className="border-b border-line px-5 py-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="font-display text-sm tracking-[0.3em] text-ink"
        >
          maze
          <span className="ml-2 text-[10px] tracking-[0.2em] text-cyan">admin</span>
        </Link>
        <p className="mt-2 truncate text-xs text-muted">{displayName}</p>
        <p className="text-[10px] uppercase tracking-wider text-faint">
          {staff?.role}
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const showOrdersBadge = item.href === "/admin/orders";
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-cyan/15 text-cyan"
                  : "text-muted hover:bg-bg-2 hover:text-ink",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <span className="truncate">{item.label}</span>
                {showOrdersBadge && (
                  <OrdersCountBadge count={pendingOrdersCount} />
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-line p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-bg-2 hover:text-ink"
        >
          <ExternalLink className="h-4 w-4" />
          Витрина
        </Link>
        <button
          type="button"
          onClick={() => void onLogout()}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-bg-2 hover:text-ink"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-full flex-1">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-panel/60 md:flex">
        <AdminNav />
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Закрыть меню"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-line bg-[#07080f] shadow-2xl">
            <div className="flex items-center justify-end border-b border-line px-3 py-2">
              <button
                type="button"
                aria-label="Закрыть"
                className="rounded-lg p-2 text-muted hover:bg-bg-2 hover:text-ink"
                onClick={() => setMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminNav onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-[#07080f]/90 px-4 py-3 backdrop-blur md:px-6 md:py-4">
          <button
            type="button"
            aria-label="Открыть меню"
            className="grid h-10 w-10 place-items-center rounded-xl border border-line text-muted transition hover:bg-bg-2 hover:text-ink md:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-sm tracking-[0.2em] text-muted uppercase">
            Панель управления
          </h1>
        </header>
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
