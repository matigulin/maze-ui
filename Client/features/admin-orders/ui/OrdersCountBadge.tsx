"use client";

import { cn } from "@/lib/utils";

/** Бейдж числа рядом с «Заказы» — тот же акцент, что у избранного в шапке. */
export function OrdersCountBadge({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gradient-to-br from-cyan to-blue px-1 text-[10px] font-bold tabular-nums text-[#04121a]",
        className,
      )}
      aria-label={`Новых заказов: ${count}`}
    >
      {label}
    </span>
  );
}
