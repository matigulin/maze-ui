"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { LogOut, MapPin, Package, Plus, Building2, Heart } from "lucide-react";
import { useCart } from "@/components/store";
import { ProductCard } from "@/components/ProductCard";
import { Field, fieldCls } from "@/components/Field";
import { products } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";

type Tab = "profile" | "orders" | "wishlist" | "addresses" | "company";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Профиль" },
  { id: "orders", label: "Мои заказы" },
  { id: "wishlist", label: "Избранное" },
  { id: "addresses", label: "Адреса" },
  { id: "company", label: "Компания" },
];

export function AccountClient({ initialTab = "profile" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const { wishlist } = useCart();
  const wished = products.filter((p) => wishlist.includes(p.id));

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">MAZE ID</p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Личный кабинет
          </h1>
        </div>
        <button className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:border-magenta/50 hover:text-magenta cursor-pointer">
          <LogOut size={15} />
          Выйти
        </button>
      </div>

      {/* Табы */}
      <div className="mb-8 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
              tab === t.id ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {tab === t.id && (
              <motion.span
                layoutId="acc-tab"
                className="absolute inset-0 -z-10 rounded-full bg-white/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {t.label}
            {t.id === "wishlist" && wished.length > 0 && (
              <span className="ml-1.5 text-xs text-cyan">{wished.length}</span>
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {tab === "profile" && <Profile />}
        {tab === "orders" && <Orders />}
        {tab === "wishlist" && <Wishlist items={wished} />}
        {tab === "addresses" && <Addresses />}
        {tab === "company" && <Company />}
      </motion.div>
    </div>
  );
}

function Profile() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="glass max-w-3xl space-y-5 rounded-3xl p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Имя" defaultValue="Демо" />
        <Field label="Фамилия" defaultValue="Пользователь" />
        <Field label="Отчество" defaultValue="Тестович" />
        <div className="space-y-1.5">
          <label className="block text-xs font-medium uppercase tracking-wider text-muted">
            Пол
          </label>
          <select className={`${fieldCls} cursor-pointer appearance-none`}>
            <option className="bg-panel">Мужской</option>
            <option className="bg-panel">Женский</option>
          </select>
        </div>
        <Field label="Телефон" type="tel" defaultValue="+7 (999) 123-45-67" />
        <Field label="E-mail" type="email" defaultValue="demo@maze.ru" />
        <Field label="Дата рождения" type="date" defaultValue="1996-05-15" />
      </div>
      <div className="space-y-2 pt-1">
        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input type="checkbox" defaultChecked className="maze-check" />
          Согласен на e-mail рассылку
        </label>
        <label className="flex items-center gap-2.5 text-sm text-muted">
          <input type="checkbox" className="maze-check" />
          Согласен на SMS рассылку
        </label>
      </div>
      <button className="btn-primary">Сохранить изменения</button>
    </form>
  );
}

function Orders() {
  const p = products.find((x) => x.slug === "iphone-15-pro-max")!;
  return (
    <div className="max-w-2xl space-y-4">
      <div className="glass rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-display font-semibold">Заказ #MAZE-1042</p>
            <p className="text-xs text-faint">15 мая 2026</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-cyan/15 px-3 py-1 text-xs font-medium text-cyan">
            <Package size={13} />
            Доставлен
          </span>
        </div>
        <Link
          href={`/product/${p.slug}`}
          className="flex items-center justify-between rounded-xl border border-line p-3 transition-colors hover:border-white/20"
        >
          <span className="text-sm">{p.name}</span>
          <span className="font-display font-semibold">
            {formatPrice(p.price)}
          </span>
        </Link>
      </div>
    </div>
  );
}

function Wishlist({ items }: { items: typeof products }) {
  if (items.length === 0) {
    return (
      <Empty
        icon={<Heart size={30} />}
        title="В избранном пусто"
        text="Добавляйте товары в избранное — они появятся здесь."
        cta
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function Addresses() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="glass flex items-start gap-3 rounded-2xl p-5">
        <MapPin size={18} className="mt-0.5 text-cyan" />
        <div>
          <p className="font-medium">Санкт-Петербург, Чайковского, 56</p>
          <p className="text-xs text-faint">Основной адрес · кв. 12</p>
        </div>
      </div>
      <button className="btn-ghost">
        <Plus size={16} />
        Добавить адрес
      </button>
    </div>
  );
}

function Company() {
  return (
    <Empty
      icon={<Building2 size={30} />}
      title="Нет компаний"
      text="Добавьте компанию и совершайте покупки с оплатой по счёту."
      ctaLabel="Добавить компанию"
    />
  );
}

function Empty({
  icon,
  title,
  text,
  cta,
  ctaLabel,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  cta?: boolean;
  ctaLabel?: string;
}) {
  return (
    <div className="glass flex max-w-lg flex-col items-center gap-4 rounded-3xl p-12 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-muted">
        {icon}
      </div>
      <div>
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{text}</p>
      </div>
      {cta ? (
        <Link href="/catalog" className="btn-primary">
          Перейти в каталог
        </Link>
      ) : ctaLabel ? (
        <button className="btn-ghost">
          <Plus size={16} />
          {ctaLabel}
        </button>
      ) : null}
    </div>
  );
}
