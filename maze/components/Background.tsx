"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; vx: number; vy: number };

/**
 * Ambient-фон MAZE: иридесцентные морфинг-блобы (CSS) + canvas-плексус
 * «созвездие», реагирующее на курсор. Уважает prefers-reduced-motion.
 */
export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: P[] = [];
    const mouse = { x: -9999, y: -9999 };

    const LINK_DIST = 132;
    const MOUSE_DIST = 190;

    function init() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(Math.floor((w * h) / 15000), 120);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }));
    }

    const GREEN_LINE = (alpha: number) => `rgba(36, 52, 46, ${alpha})`;

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      for (const p of particles) {
        // движение
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // мягкое отталкивание от курсора
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < MOUSE_DIST) {
          const f = (1 - md / MOUSE_DIST) * 0.6;
          p.x += (mdx / (md || 1)) * f;
          p.y += (mdy / (md || 1)) * f;
        }
      }

      // связи между точками
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.28;
            ctx!.strokeStyle = GREEN_LINE(alpha);
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }

        // связь с курсором
        const dxm = a.x - mouse.x;
        const dym = a.y - mouse.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < MOUSE_DIST) {
          const alpha = (1 - dm / MOUSE_DIST) * 0.4;
          ctx!.strokeStyle = GREEN_LINE(alpha);
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.stroke();
        }
      }

      // точки
      for (const p of particles) {
        ctx!.fillStyle = GREEN_LINE(0.4);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    let raf = 0;
    let running = true;
    let scrollPaused = false;
    let scrollResumeTimer = 0;

    function loop() {
      if (!running || scrollPaused) return;
      draw();
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onResize = () => init();
    const onVisibility = () => {
      running = !document.hidden;
      if (running && !scrollPaused) loop();
      else cancelAnimationFrame(raf);
    };
    /** На скролле canvas жрёт кадры вместе со sticky-header — пауза ~120ms. */
    const onScroll = () => {
      if (reduce) return;
      scrollPaused = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(scrollResumeTimer);
      scrollResumeTimer = window.setTimeout(() => {
        scrollPaused = false;
        if (running) loop();
      }, 120);
    };

    init();
    if (reduce) {
      draw(); // один статичный кадр
    } else {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseout", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      loop();
    }
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(scrollResumeTimer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-40" />
    </div>
  );
}
