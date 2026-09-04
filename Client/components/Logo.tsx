"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { scrollWindowToTop } from "@/lib/scroll";

export function Logo({
  className,
  compact = false,
  onNavigate,
}: {
  className?: string;
  compact?: boolean | "mobile";
  /** Например закрыть мобильное меню после перехода. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <Link
      href="/"
      className={cn("inline-flex min-w-0 shrink items-center", className)}
      aria-label={onHome ? "MAZE — наверх" : "MAZE — на главную"}
      onClick={(e) => {
        onNavigate?.();
        if (!onHome) return;
        e.preventDefault();
        scrollWindowToTop();
      }}
    >
      <svg
        width="140"
        height="40"
        viewBox="0 0 140 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "w-auto",
          compact === true && "h-7 max-w-[6.5rem]",
          compact === "mobile" && "h-7 max-w-[6.5rem] md:h-8 md:max-w-none",
          !compact && "h-8",
        )}
        aria-hidden
      >
        <path
          d="M23.65 33 H35 L23.65 9.5 L12.3 33 H16.85 L23.65 19.5 L30.45 33"
          stroke="#F0EDE6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="48"
          y="28"
          fill="#F0EDE6"
          style={{
            fontFamily: "var(--font-barlow), sans-serif",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.32em",
          }}
        >
          MAZE
        </text>
      </svg>
    </Link>
  );
}
