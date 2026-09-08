"use client";

import {
  orderStatusClassName,
  orderStatusLabel,
  orderStatusStyle,
} from "../lib/order-status";

export function OrderStatusText({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={orderStatusClassName(status, className)}
      style={orderStatusStyle(status)}
    >
      {orderStatusLabel(status)}
    </span>
  );
}
