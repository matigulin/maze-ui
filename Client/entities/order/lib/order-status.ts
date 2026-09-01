import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "awaiting_payment"
  | "paid"
  | "shipping"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Новый",
  confirmed: "Подтверждён",
  awaiting_payment: "Ждёт оплату",
  paid: "Оплачен",
  shipping: "В доставке",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

export const TERMINAL_ORDER_STATUSES = new Set<OrderStatus>([
  "delivered",
  "cancelled",
]);

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status as OrderStatus] ?? status;
}

export function isActiveOrderStatus(status: string): boolean {
  return !TERMINAL_ORDER_STATUSES.has(status as OrderStatus);
}

/** Новый заказ в админке — ещё не принят в работу. */
export function isNewOrderStatus(status: string): boolean {
  return status === "pending";
}

/** Inline color — надёжнее Tailwind-утилит внутри `td.text-ink`. */
export function orderStatusColor(status: string): string | undefined {
  switch (status) {
    case "pending":
      return "#6b9a7a";
    case "confirmed":
    case "awaiting_payment":
    case "paid":
      return "#ad946b";
    case "shipping":
      return "#c4a060";
    case "delivered":
      return "#a89880";
    case "cancelled":
      return "#b85c5c";
    default:
      return undefined;
  }
}

export function orderStatusStyle(status: string): CSSProperties | undefined {
  const color = orderStatusColor(status);
  return color ? { color } : undefined;
}

export function orderStatusClassName(status: string, className?: string) {
  return cn("font-medium", className);
}
