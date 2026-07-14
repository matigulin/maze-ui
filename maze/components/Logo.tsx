"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { scrollWindowToTop } from "@/lib/scroll";

export function Logo({ className }: { className?: string }) {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center", className)}
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
        className="h-9 w-auto"
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
