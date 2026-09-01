"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { UserOrderListItem } from "../api/user-orders-api";
import { fetchUserOrder, type UserOrderDetail } from "../api/user-orders-api";
import { formatOrderDate } from "../lib/format-order-date";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderItemThumb } from "./OrderItemThumb";
import { cn, formatPrice } from "@/lib/utils";

type AccountOrderCardProps = {
  order: UserOrderListItem;
  ensureAccessToken: () => Promise<string | null>;
};

export function AccountOrderCard({
  order,
  ensureAccessToken,
}: AccountOrderCardProps) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<UserOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);

  async function loadDetail() {
    setDetailLoading(true);
    setDetailError(false);
    try {
      const token = await ensureAccessToken();
      if (!token) {
        setDetailError(true);
        return;
      }
      setDetail(await fetchUserOrder(token, order.id));
    } catch {
      setDetailError(true);
    } finally {
      setDetailLoading(false);
    }
  }

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next || detail || detailLoading) return;
    await loadDetail();
  }

  return (
    <div className="glass rounded-2xl p-5">
      <button
        type="button"
        onClick={() => void toggle()}
        className="flex w-full items-start justify-between gap-3 text-left cursor-pointer"
      >
        <div className="min-w-0">
          <p className="font-display font-semibold">Заказ #{order.orderNumber}</p>
          <p className="mt-0.5 text-xs text-faint">{formatOrderDate(order.createdAt)}</p>
          <p className="mt-2 text-sm text-muted">
            {order.itemsCount}{" "}
            {order.itemsCount === 1
              ? "товар"
              : order.itemsCount < 5
                ? "товара"
                : "товаров"}{" "}
            · {formatPrice(order.totalRub)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <ChevronDown
            size={18}
            className={cn(
              "text-muted transition-transform",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      {open && (
        <div className="mt-4 border-t border-line pt-4">
          {detailLoading && (
            <p className="text-sm text-muted">Загружаем состав заказа…</p>
          )}
          {!detailLoading && detail && (
            <div className="space-y-3">
              {detail.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-line p-3"
                >
                  <OrderItemThumb
                    image={item.image}
                    name={item.name}
                    className="h-16 w-16 sm:h-20 sm:w-20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-faint">
                      {[
                        item.color,
                        item.memory,
                        `${item.quantity} шт.`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-sm font-medium tabular-nums">
                    {formatPrice(item.lineTotal)}
                  </div>
                </div>
              ))}
              {detail.delivery && (
                <p className="text-xs text-muted">
                  Доставка: {detail.delivery.city}, {detail.delivery.street},{" "}
                  {detail.delivery.house}
                  {detail.delivery.apartment
                    ? `, кв. ${detail.delivery.apartment}`
                    : ""}
                </p>
              )}
            </div>
          )}
          {!detailLoading && !detail && detailError && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <p className="text-sm text-muted">
                Не удалось загрузить состав заказа.
              </p>
              <button
                type="button"
                onClick={() => void loadDetail()}
                className="btn-ghost shrink-0 px-3 py-1.5 text-xs"
              >
                Повторить
              </button>
            </div>
          )}
          {!detailLoading && !detail && !detailError && (
            <p className="text-sm text-muted">
              Состав заказа временно недоступен.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
