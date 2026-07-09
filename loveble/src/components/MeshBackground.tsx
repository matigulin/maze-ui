import { useEffect, useRef } from "react";

type Blob = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  weight: number;
};

const COLORS = ["#000046", "#041759", "#1cb5e0", "#2980b9"];

export function MeshBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.4, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const blobs: Blob[] = COLORS.map((color, i) => ({
      x: Math.random(),
      y: Math.random(),
      tx: Math.random(),
      ty: Math.random(),
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      r: 0.55 + Math.random() * 0.25,
      color,
      weight: [0.25, 0.35, 1.4, 0.2][i], // cyan + subtle drift for others
    }));

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
      mouseRef.current.active = true;
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("resize", resize);

    let raf = 0;
    const render = () => {
      // base fill
      ctx.fillStyle = "#000028";
      ctx.fillRect(0, 0, width, height);

      const maxDim = Math.max(width, height);
      const mouse = mouseRef.current;

      blobs.forEach((b) => {
        if (!reduce) {
          // autonomous drift
          b.tx += b.vx;
          b.ty += b.vy;
          if (b.tx < 0.1 || b.tx > 0.9) b.vx *= -1;
          if (b.ty < 0.1 || b.ty > 0.9) b.vy *= -1;

          // mouse influence
          if (mouse.active) {
            b.tx += (mouse.x - b.tx) * 0.05 * b.weight;
            b.ty += (mouse.y - b.ty) * 0.05 * b.weight;
          }

          // ease to target
          b.x += (b.tx - b.x) * 0.08;
          b.y += (b.ty - b.y) * 0.08;
        } else {
          b.x = b.tx;
          b.y = b.ty;
        }

        const cx = b.x * width;
        const cy = b.y * height;
        const radius = b.r * maxDim;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, hexToRgba(b.color, 0.85));
        grad.addColorStop(0.45, hexToRgba(b.color, 0.25));
        grad.addColorStop(1, hexToRgba(b.color, 0));
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      ctx.globalCompositeOperation = "source-over";
      // vignette
      const vg = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.3,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, width, height);

      if (!reduce) raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}

function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
