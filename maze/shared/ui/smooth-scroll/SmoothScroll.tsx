"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";

/**
 * Плавный скролл только на десктопе (колесо / трекпад).
 * На таче, Telegram WebView и coarse-pointer — нативный скролл:
 * Lenis + инерция ОС дают дёрганья при резком вниз↔вверх.
 */
function shouldUseLenis(): boolean {
  if (typeof window === "undefined") return false;
  // Тач / «толстый» указатель (телефоны, часть планшетов)
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
    return false;
  }
  // Узкий экран даже с мышью (DevTools, складные)
  if (window.matchMedia("(max-width: 768px)").matches) return false;
  return true;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !shouldUseLenis()) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      // Явно: не трогаем тач-инерцию (Telegram / iOS / Android)
      syncTouch: false,
      touchMultiplier: 1,
    });

    document.documentElement.classList.add("lenis", "lenis-smooth");

    let raf = 0;
    const frame = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      document.documentElement.classList.remove("lenis", "lenis-smooth");
    };
  }, [reduce]);

  return children;
}
