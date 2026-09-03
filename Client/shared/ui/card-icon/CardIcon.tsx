import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CardIconSize = "sm" | "md" | "lg";

const SIZE: Record<CardIconSize, string> = {
  sm: "card-icon--sm",
  md: "",
  lg: "card-icon--lg",
};

/**
 * Иконка на карточках: акцент-круг + тёмная обводка (как кнопка «+»).
 * Shared UI — без бизнес-логики.
 */
export function CardIcon({
  children,
  size = "md",
  className,
}: {
  children: ReactNode;
  size?: CardIconSize;
  className?: string;
}) {
  return (
    <span className={cn("card-icon", SIZE[size], className)} aria-hidden>
      {children}
    </span>
  );
}
