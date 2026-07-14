"use client";

import Link from "next/link";
import { useId } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { scrollWindowToTop } from "@/lib/scroll";

export function Logo({
  className,
  wordmark = true,
}: {
  className?: string;
  wordmark?: boolean;
}) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const gradId = useId().replace(/:/g, "");

  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label={onHome ? "MAZE — наверх" : "MAZE — на главную"}
      onClick={(e) => {
        if (!onHome) return;
        e.preventDefault();
        scrollWindowToTop();
      }}
    >
      <span className="relative inline-grid h-9 w-9 place-items-center">
        <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="40" y2="40">
              <stop stopColor="#35e4f0" />
              <stop offset="0.5" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#ff3d8b" />
            </linearGradient>
          </defs>
          <path
            d="M20 4 L35 31 H5 Z"
            stroke={`url(#${gradId})`}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M20 13 L27.5 26 H12.5 Z"
            stroke={`url(#${gradId})`}
            strokeWidth="1.6"
            strokeLinejoin="round"
            opacity="0.7"
          />
          <circle cx="20" cy="21" r="1.8" fill="#35e4f0" />
        </svg>
        <span
          className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle, rgba(53,228,240,0.35) 0%, transparent 70%)",
          }}
          aria-hidden
        />
      </span>
      {wordmark && (
        <span className="font-display text-lg font-semibold tracking-[0.35em] text-ink">
          maze
        </span>
      )}
    </Link>
  );
}
