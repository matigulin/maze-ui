"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { useUserOrders } from "../model/use-user-orders";
import { groupUserOrders } from "../lib/group-orders";
import { AccountOrderCard } from "./AccountOrderCard";

type AccountOrdersPanelProps = {
  ensureAccessToken: () => Promise<string | null>;
};

function OrdersSection({
  title,
  orders,
  ensureAccessToken,
}: {
  title: string;
  orders: ReturnType<typeof groupUserOrders>["active"];
  ensureAccessToken: () => Promise<string | null>;
}) {
  if (orders.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-faint">
        {title}
      </h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <AccountOrderCard
            key={order.id}
            order={order}
            ensureAccessToken={ensureAccessToken}
          />
        ))}
      </div>
    </section>
  );
}

export function AccountOrdersPanel({
  ensureAccessToken,
}: AccountOrdersPanelProps) {
  const { orders, loading, error } = useUserOrders(ensureAccessToken, true);
  const { active, completed } = groupUserOrders(orders);

  if (loading) {
    return (
      <div className="glass rounded-3xl p-10 text-sm text-muted">
        Загружаем заказы…
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-3xl p-8 text-sm text-muted">{error}</div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="glass flex max-w-lg flex-col items-center gap-4 rounded-3xl p-12 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-muted">
          <Package size={30} />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Заказов пока нет</h2>
          <p className="mt-1 text-sm text-muted">
            Оформите первый заказ — он появится здесь со статусом в реальном
            времени.
          </p>
        </div>
        <Link href="/catalog" className="btn-primary">
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <OrdersSection
        title="Текущие"
        orders={active}
        ensureAccessToken={ensureAccessToken}
      />
      <OrdersSection
        title="Завершённые"
        orders={completed}
        ensureAccessToken={ensureAccessToken}
      />
    </div>
  );
}
