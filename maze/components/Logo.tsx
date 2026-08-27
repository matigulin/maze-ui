"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { scrollWindowToTop } from "@/lib/scroll";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  /** true — всегда компактный; "mobile" — только до md */
  compact?: boolean | "mobile";
}) {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <Link
      href="/"
      className={cn("inline-flex min-w-0 shrink items-center", className)}
      aria-label={onHome ? "MAZE — наверх" : "MAZE — на главную"}
      onClick={(e) => {
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
          compact === true && "h-8 max-w-[6.75rem]",
          compact === "mobile" && "h-8 max-w-[6.75rem] md:h-9 md:max-w-none",
          !compact && "h-9",
        )}
        aria-hidden
      >
        <path
          d="M23.65 33 H35 L23.65 9.5 L12.3 33 H16.85 L23.65 19.5 L30.45 33"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text
          x="48"
          y="29"
          fill="white"
          style={{
            fontFamily: "var(--font-orbitron), sans-serif",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.28em",
          }}
        >
          maze
        </text>
      </svg>
    </Link>
  );
}
