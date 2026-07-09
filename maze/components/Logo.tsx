import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  wordmark = true,
}: {
  className?: string;
  wordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="MAZE — на главную"
    >
      <span className="relative inline-grid h-9 w-9 place-items-center">
        <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none">
          <defs>
            <linearGradient id="maze-lg" x1="0" y1="0" x2="40" y2="40">
              <stop stopColor="#35e4f0" />
              <stop offset="0.5" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#ff3d8b" />
            </linearGradient>
          </defs>
          {/* призма-лабиринт */}
          <path
            d="M20 4 L35 31 H5 Z"
            stroke="url(#maze-lg)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M20 13 L27.5 26 H12.5 Z"
            stroke="url(#maze-lg)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            opacity="0.7"
          />
          <circle cx="20" cy="21" r="1.8" fill="#35e4f0" />
        </svg>
        <span className="absolute inset-0 -z-10 rounded-full bg-cyan/25 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
      </span>
      {wordmark && (
        <span className="font-display text-lg font-semibold tracking-[0.35em] text-ink">
          maze
        </span>
      )}
    </Link>
  );
}
