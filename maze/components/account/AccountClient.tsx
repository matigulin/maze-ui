"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { MapPin, Package, Plus, Building2, Heart } from "lucide-react";
import { useCart } from "@/components/store";
import { ProductCard } from "@/components/ProductCard";
import { AccountProfile } from "@/features/account";
import { useUserAuth } from "@/features/auth";
import { useModal } from "@/components/modals";
import { products, type Product } from "@/lib/data";
import { apiGet } from "@/lib/api";
import { shouldUseMocks } from "@/lib/mocks";
import {
  mapProductListItemToUiProduct,
  type ProductListItemDto,
} from "@/lib/mappers/catalog";
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
  const { ready, isAuthenticated } = useUserAuth();
  const { open } = useModal();
  const [wished, setWished] = useState<Product[]>([]);

  useEffect(() => {
    if (wishlist.length === 0) {
      setWished([]);
      return;
    }

    if (shouldUseMocks()) {
      setWished(products.filter((p) => wishlist.includes(p.id)));
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const items = await apiGet<ProductListItemDto[]>("/catalog/products", {
          limit: 48,
          page: 1,
        });
        if (cancelled) return;
        const mapped = items
          .map(mapProductListItemToUiProduct)
          .filter((p) => wishlist.includes(p.id));
        setWished(mapped);
      } catch {
        if (!cancelled) setWished([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [wishlist]);

  if (!ready) {
    return (
      <div className="glass rounded-3xl p-10 text-sm text-muted">
        Загружаем личный кабинет…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="glass flex max-w-lg flex-col items-start gap-4 rounded-3xl p-8">
        <p className="eyebrow">MAZE ID</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Войдите в аккаунт
        </h1>
        <p className="text-sm text-muted">
          Профиль, заказы и сохранённая корзина доступны после входа по номеру
          телефона.
        </p>
        <button type="button" onClick={() => open("auth")} className="btn-primary">
          Войти
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">MAZE ID</p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Личный кабинет
          </h1>
        </div>
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
        {tab === "profile" && <AccountProfile />}
        {tab === "orders" && <Orders />}
        {tab === "wishlist" && <Wishlist items={wished} />}
        {tab === "addresses" && <Addresses />}
        {tab === "company" && <Company />}
      </motion.div>
    </div>
  );
}

function Orders() {
  const p = products.find((x) => x.slug === "iphone-15-pro-max");
  if (!p) {
    return (
      <Empty
        icon={<Package size={30} />}
        title="Заказов пока нет"
        text="Оформите первый заказ — он появится здесь."
        cta
      />
    );
  }
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
