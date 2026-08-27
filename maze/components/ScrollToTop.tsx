"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 200;

/**
 * Плавающая «Наверх».
 * Без cyan-glow и hover-translate — они давали «двойной» круг поверх карточек.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const aboveBuyBar = pathname.startsWith("/product/");

  useEffect(() => {
    const readY = () =>
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const update = () => {
      setVisible(readY() > SHOW_AFTER_PX);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      aria-label="Наверх"
      className={cn(
        "fixed z-[60] grid h-11 w-11 place-items-center rounded-full",
        "border border-cyan/55 bg-[#0a1020] text-cyan",
        "shadow-none outline-none ring-0",
        "transition-colors hover:border-cyan hover:bg-[#10182c]",
        "focus-visible:ring-2 focus-visible:ring-cyan/40",
        "cursor-pointer",
        "right-[max(1rem,env(safe-area-inset-right))]",
        aboveBuyBar
          ? "bottom-[max(5.25rem,calc(env(safe-area-inset-bottom)+4.5rem))] md:bottom-8"
          : "bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+1rem))] md:bottom-8",
        "md:right-8",
      )}
    >
      <ArrowUp size={18} strokeWidth={2.25} aria-hidden />
    </button>
  );
}
