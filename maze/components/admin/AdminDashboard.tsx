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
} from "lucide-react";
import { useStaffAuth } from "@/components/staff/StaffAuthProvider";

const SECTIONS = [
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
  const { displayName } = useStaffAuth();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-sm text-muted">Здравствуйте, {displayName}</p>
        <h2 className="mt-1 font-display text-2xl tracking-wide text-ink">
          Обзор админки
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Каркас панели готов: вход staff, защита маршрута и оболочка.
          Разделы CRUD подключим к уже готовому API{" "}
          <code className="rounded bg-bg-2 px-1.5 py-0.5 text-cyan">/admin/*</code>.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
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
                    <h3 className="font-medium text-ink">{section.title}</h3>
                    <ArrowRight className="h-4 w-4 text-cyan" />
                  </div>
                  <p className="mt-1 text-sm text-muted">{section.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-cyan/20 bg-cyan/5 p-5">
        <p className="text-sm text-ink">
          API уже отвечает. Следующий шаг — CRUD категорий и товаров.
        </p>
        <Link
          href="/"
          className="mt-3 inline-flex items-center gap-2 text-sm text-cyan transition hover:opacity-80"
        >
          Открыть витрину
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
