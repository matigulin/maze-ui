"use client";

import { Package } from "lucide-react";
import {
  orderStatusClassName,
  orderStatusLabel,
  orderStatusStyle,
} from "@/entities/order";

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={orderStatusClassName(
        status,
        "inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium",
      )}
      style={orderStatusStyle(status)}
    >
      <Package size={13} />
      {orderStatusLabel(status)}
    </span>
  );
}
