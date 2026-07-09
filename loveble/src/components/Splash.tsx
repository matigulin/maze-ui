import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export function Splash() {
  const [hidden, setHidden] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 600 : 2800;
    const fade = setTimeout(() => setFadeOut(true), duration);
    const off = setTimeout(() => setHidden(true), duration + 500);
    return () => {
      clearTimeout(fade);
      clearTimeout(off);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-maze-navy-deep transition-opacity duration-500 ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-maze-cyan/25 blur-[120px]" />
      </div>

      <svg
        width="120"
        height="112"
        viewBox="0 0 64 60"
        fill="none"
        className="relative"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="splash-mark" cx="50%" cy="60%" r="65%">
            <stop offset="0%" stopColor="#6dd5fa" />
            <stop offset="60%" stopColor="#1cb5e0" />
            <stop offset="100%" stopColor="#065287" />
          </radialGradient>
        </defs>
        {[
          "M4 56 L32 6 L60 56",
          "M16 56 L32 27 L48 56",
          "M26 56 L32 45 L38 56",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="url(#splash-mark)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="200"
            strokeDashoffset="200"
            style={{
              animation: `maze-draw 0.9s ${0.15 + i * 0.25}s ease-out forwards`,
              filter: "drop-shadow(0 0 12px rgba(28,181,224,0.6))",
            }}
          />
        ))}
      </svg>

      <div
        className="mt-6 opacity-0"
        style={{ animation: "maze-fade-up 0.7s 1.2s ease-out forwards" }}
      >
        <Logo variant="full" size={42} tone="white" />
      </div>

      <div className="absolute bottom-12 h-px w-40 overflow-hidden bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-transparent via-maze-cyan to-transparent"
          style={{
            backgroundSize: "200% 100%",
            animation: "maze-shimmer 1.6s linear infinite",
          }}
        />
      </div>
    </div>
  );
}
