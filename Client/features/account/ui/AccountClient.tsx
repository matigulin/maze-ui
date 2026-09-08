"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { MapPin, Plus, Building2, Heart } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { AccountProfile } from "./AccountProfile";
import { ACCOUNT_TAB_EVENT } from "../lib/tab-event";
import { products, type Product } from "@/lib/data";
import { apiGetWithMeta } from "@/lib/api";
import { shouldUseMocks } from "@/lib/mocks";
import {
  mapProductListItemToUiProduct,
  type ProductListItemDto,
} from "@/lib/mappers/catalog";
import { resetWindowScroll } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/entities/user";

type Tab = "profile" | "orders" | "wishlist" | "addresses" | "company";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Профиль" },
  { id: "orders", label: "Мои заказы" },
  { id: "wishlist", label: "Избранное" },
  { id: "addresses", label: "Адреса" },
  { id: "company", label: "Компания" },
];

const VALID_TABS: Tab[] = TABS.map((t) => t.id);

function parseTab(raw: string | null | undefined): Tab {
  return VALID_TABS.includes(raw as Tab) ? (raw as Tab) : "profile";
}

function tabHref(id: Tab) {
  return id === "profile" ? "/account" : `/account?tab=${id}`;
}

export type AccountClientProps = {
  initialTab?: Tab;
  wishlistIds: string[];
  ready: boolean;
  isAuthenticated: boolean;
  ensureAccessToken: () => Promise<string | null>;
  onLogin: () => void;
  /** После сохранения профиля — синхронизация auth (widget). */
  onProfileSaved?: (profile: UserProfile) => void;
  /** Вкладка «Мои заказы» — из widget (features/account-orders). */
  ordersPanel?: ReactNode;
  /** Слот в форме профиля (LogoutButton из widget). */
  profileFooterActions?: ReactNode;
};

export function AccountClient({
  initialTab = "profile",
  wishlistIds,
  ready,
  isAuthenticated,
  ensureAccessToken,
  onLogin,
  onProfileSaved,
  ordersPanel,
  profileFooterActions,
}: AccountClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = parseTab(searchParams.get("tab"));
  const [tab, setTab] = useState<Tab>(() =>
    parseTab(searchParams.get("tab") ?? initialTab),
  );
  const [seenUrlTab, setSeenUrlTab] = useState(urlTab);
  const [wished, setWished] = useState<Product[]>([]);
  const useMocks = shouldUseMocks();
  const wishedItems = useMocks
    ? products.filter((p) => wishlistIds.includes(p.id))
    : wishlistIds.length === 0
      ? []
      : wished;

  if (urlTab !== seenUrlTab) {
    setSeenUrlTab(urlTab);
    setTab(urlTab);
  }

  function selectTab(next: Tab) {
    setTab(next);
    router.replace(tabHref(next));
    resetWindowScroll();
  }

  useEffect(() => {
    function onAccountTab(e: Event) {
      setTab(parseTab((e as CustomEvent<string>).detail));
    }
    window.addEventListener(ACCOUNT_TAB_EVENT, onAccountTab);
    return () => window.removeEventListener(ACCOUNT_TAB_EVENT, onAccountTab);
  }, []);

  useEffect(() => {
    if (useMocks || wishlistIds.length === 0) return;

    let cancelled = false;
    const wanted = new Set(wishlistIds);

    void (async () => {
      try {
        const found = new Map<string, Product>();
        let page = 1;
        const limit = 48;

        while (!cancelled && found.size < wanted.size) {
          const { data: items, meta } = await apiGetWithMeta<
            ProductListItemDto[]
          >("/catalog/products", { limit, page });
          if (cancelled) return;

          for (const dto of items) {
            const p = mapProductListItemToUiProduct(dto);
            if (wanted.has(p.id)) found.set(p.id, p);
          }

          const total = meta?.total;
          const done =
            found.size >= wanted.size ||
            items.length < limit ||
            (total != null && page * limit >= total);
          if (done) break;
          page += 1;
        }

        if (!cancelled) setWished([...found.values()]);
      } catch {
        if (!cancelled) setWished([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [wishlistIds, useMocks]);

  if (!ready) {
    return (
      <div className="glass rounded-3xl p-10 text-sm text-muted">
        Загружаем личный кабинет…
      </div>
    );
  }

  // Гость: избранное доступно без входа; корзина и остальной кабинет — только после логина.
  if (!isAuthenticated && tab !== "wishlist") {
    return (
      <div className="glass flex max-w-lg flex-col items-start gap-4 rounded-3xl p-8">
        <p className="eyebrow">MAZE ID</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Войдите в аккаунт
        </h1>
        <p className="text-sm text-muted">
          Профиль, заказы и корзина доступны после входа. Избранное можно
          собирать без аккаунта — оно сохранится на этом устройстве.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onLogin} className="btn-primary">
            Войти
          </button>
          <button
            type="button"
            onClick={() => selectTab("wishlist")}
            className="btn-ghost"
          >
            К избранному
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow mb-2">MAZE ID</p>
          <h1 className="font-display text-3xl font-bold tracking-tight break-words sm:text-4xl md:text-5xl">
            {isAuthenticated ? "Личный кабинет" : "Избранное"}
          </h1>
        </div>
        {!isAuthenticated && (
          <button type="button" onClick={onLogin} className="btn-ghost shrink-0">
            Войти
          </button>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const guestBlocked = !isAuthenticated && t.id !== "wishlist";
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (guestBlocked) {
                  onLogin();
                  return;
                }
                selectTab(t.id);
              }}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                tab === t.id ? "text-ink" : "text-muted hover:text-ink",
                guestBlocked && "opacity-50",
              )}
              title={
                guestBlocked ? "Доступно после входа" : undefined
              }
            >
              {tab === t.id && (
                <motion.span
                  layoutId="acc-tab"
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-white/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {t.label}
              {t.id === "wishlist" && wishedItems.length > 0 && (
                <span className="ml-1.5 text-xs text-cyan">{wishedItems.length}</span>
              )}
            </button>
          );
        })}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {tab === "wishlist" && <Wishlist items={wishedItems} />}
        {isAuthenticated && tab === "profile" && (
          <AccountProfile
            ensureAccessToken={ensureAccessToken}
            isAuthenticated={isAuthenticated}
            onProfileSaved={onProfileSaved}
            footerActions={profileFooterActions}
          />
        )}
        {isAuthenticated && tab === "orders" && ordersPanel}
        {isAuthenticated && tab === "addresses" && <Addresses />}
        {isAuthenticated && tab === "company" && <Company />}
      </motion.div>
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
    <div className="grid w-full grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 [grid-template-columns:minmax(0,1fr)_minmax(0,1fr)] lg:[grid-template-columns:repeat(3,minmax(0,1fr))] xl:[grid-template-columns:repeat(4,minmax(0,1fr))]">
      {items.map((p) => (
        <div key={p.id} className="min-w-0 max-w-full">
          <ProductCard product={p} />
        </div>
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
      <button type="button" className="btn-ghost">
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
        <button type="button" className="btn-ghost">
          <Plus size={16} />
          {ctaLabel}
        </button>
      ) : null}
    </div>
  );
}
