"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { resetWindowScroll } from "@/lib/scroll";

/**
 * При любой смене pathname / query всегда показываем страницу сверху.
 * Нужен, потому что отдельные Link могут отключать scroll, а soft-nav
 * Next иногда сохраняет позицию после длинного скролла каталога.
 */
export function RouteScrollReset() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    resetWindowScroll();
  }, [routeKey]);

  return null;
}
