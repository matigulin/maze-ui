"use client";

import Link from "next/link";
import {
  Layers,
  Package,
  ImageIcon,
  FileText,
  Warehouse,
  Settings,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import {
  OrdersCountBadge,
  usePendingOrdersCount,
} from "@/features/admin-orders";

const SECTIONS = [
  {
    title: "Заказы",
    desc: "Клиенты, товары и статусы заказов",
    icon: ShoppingBag,
    href: "/admin/orders",
  },
  {
    title: "Категории",
    desc: "Дерево брендов и подкатегорий",
    icon: Layers,
    href: "/admin/catalog/categories",
  },
  {
    title: "Товары",
    desc: "Карточки, варианты, фото, характеристики",
    icon: Package,
    href: "/admin/catalog/products",
  },
  {
    title: "Баннеры и слайды",
    desc: "Контент главной страницы",
    icon: ImageIcon,
    href: "/admin/content/banners",
  },
  {
    title: "CMS",
    desc: "Доставка, гарантия, о магазине",
    icon: FileText,
    href: "/admin/content/cms",
  },
  {
    title: "Склад",
    desc: "Быстрое обновление остатков",
    icon: Warehouse,
    href: "/admin/stock",
  },
  {
    title: "Настройки",
    desc: "Контакты и выбор редакции",
    icon: Settings,
    href: "/admin/settings/site",
  },
] as const;

export function AdminDashboard() {
  const { count: pendingOrdersCount } = usePendingOrdersCount();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isOrders = section.href === "/admin/orders";
          return (
            <Link
              key={section.title}
              href={section.href}
              className="rounded-2xl border border-line bg-panel/50 p-5 transition hover:border-cyan/40 hover:bg-bg-2"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-bg-2 text-cyan">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 font-medium text-ink">
                      {section.title}
                      {isOrders && (
                        <OrdersCountBadge count={pendingOrdersCount} />
                      )}
                    </h3>
                    <ArrowRight className="h-4 w-4 shrink-0 text-cyan" />
                  </div>
                  <p className="mt-1 text-sm text-muted">{section.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
