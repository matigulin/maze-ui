import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Новый",
  confirmed: "Подтверждён",
  awaiting_payment: "Ждёт оплату",
  paid: "Оплачен",
  shipping: "В доставке",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}

/** Inline color — надёжнее Tailwind-утилит внутри `td.text-ink`. */
export function orderStatusColor(status: string): string | undefined {
  switch (status) {
    case "pending":
      return "#34d399"; // Новый — зелёный
    case "shipping":
      return "#fb923c"; // В доставке — оранжевый
    case "cancelled":
      return "#f87171"; // Отменён — красный
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
