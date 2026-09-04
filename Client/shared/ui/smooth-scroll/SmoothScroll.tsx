"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useReducedMotion } from "motion/react";

/**
 * Плавный скролл только на десктопе (колесо / трекпад).
 * На таче, Telegram WebView и coarse-pointer — нативный скролл.
 * lerp + autoRaf — отзывчивее на 120Hz, без тяжёлого duration.
 */
function shouldUseLenis(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
    return false;
  }
  if (window.matchMedia("(max-width: 768px)").matches) return false;
  return true;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !shouldUseLenis()) return;

    const lenis = new Lenis({
      // Без duration: lerp следует за кадром дисплея (60/120Hz)
      lerp: 0.12,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1,
      wheelMultiplier: 0.92,
      autoRaf: true,
      overscroll: true,
    });

    return () => {
      lenis.destroy();
    };
  }, [reduce]);

  return children;
}
