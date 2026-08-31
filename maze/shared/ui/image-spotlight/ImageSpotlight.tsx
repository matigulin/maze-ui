"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { durationOf, makeEase } from "./lib/easing";

export type SpotlightMode = "onImage" | "followCursor";
export type SpotlightFit = "cover" | "contain";

export type SpotlightImage = {
  src: string;
  srcSet?: string;
  alt?: string;
};

export type SpotlightTransition = {
  duration?: number;
  ease?: string | [number, number, number, number];
};

type ImageSpotlightProps = {
  image?: SpotlightImage | string;
  mode?: SpotlightMode;
  restX?: number;
  restY?: number;
  fit?: SpotlightFit;
  focusY?: number;
  veilColor?: string;
  size?: number;
  visibility?: number;
  rounded?: number;
  transition?: SpotlightTransition;
  className?: string;
  style?: CSSProperties;
  /** Рисуется под шторой — проявляется тем же лучом, что и картинка. */
  children?: ReactNode;
  /** window — луч следует за курсором по всей странице, не только над корнем. */
  pointerScope?: "root" | "window";
};

const FOLLOW = 40;

const clampFocus = (value: number) =>
  Math.min(100, Math.max(0, typeof value === "number" ? value : 50));

function resolveImageSrc(image: unknown): string | undefined {
  if (!image) return undefined;
  if (typeof image === "string") return image.trim() || undefined;
  return (image as SpotlightImage).src || undefined;
}

function maskFor(x: string, y: string, radius: number): string {
  const core = Math.round(radius * 0.15);
  const mid = Math.round(radius * 0.5);
  const penumbra = Math.round(radius * 0.85);

  return `radial-gradient(circle ${radius}px at ${x} ${y}, transparent 0px, transparent ${core}px, rgba(0, 0, 0, 0.15) ${mid}px, rgba(0, 0, 0, 0.65) ${penumbra}px, rgba(0, 0, 0, 0.96) ${radius}px)`;
}

function dustFor(x: string, y: string, radius: number): string {
  const mid = Math.round(radius * 0.45);
  return `radial-gradient(circle ${radius}px at ${x} ${y}, rgba(255, 249, 230, 0.045) 0px, rgba(201, 170, 120, 0.03) ${mid}px, transparent ${radius}px)`;
}

/**
 * Originkit Image Spotlight: veil + radial mask follows the pointer.
 */
export function ImageSpotlight({
  image,
  mode = "followCursor",
  restX = 50,
  restY = 50,
  fit = "cover",
  focusY = 37,
  veilColor = "#000000",
  size = 150,
  visibility = 15,
  rounded = 0,
  transition = { duration: 0.4, ease: "easeInOut" },
  className,
  style,
  children,
  pointerScope = "root",
}: ImageSpotlightProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const duration = durationOf(transition, 0.4);
  const easeToken = Array.isArray(transition.ease)
    ? transition.ease.join(",")
    : (transition.ease ?? "easeInOut");

  useEffect(() => {
    const rootEl = rootRef.current;
    const veilEl = veilRef.current;
    if (!rootEl || !veilEl) return;
    const root = rootEl;
    const veil = veilEl;

    const paintBeam = (x: string, y: string, radius: number) => {
      if (radius < 0.5) {
        veil.style.maskImage = "none";
        veil.style.webkitMaskImage = "none";
        const cover = coverRef.current;
        if (cover) {
          cover.style.maskImage = "none";
          cover.style.webkitMaskImage = "none";
        }
        const glow = glowRef.current;
        if (glow) glow.style.background = "none";
        return;
      }
      const mask = maskFor(x, y, radius);
      veil.style.maskImage = mask;
      veil.style.webkitMaskImage = mask;
      const cover = coverRef.current;
      if (cover) {
        cover.style.maskImage = mask;
        cover.style.webkitMaskImage = mask;
      }
      const glow = glowRef.current;
      if (glow) glow.style.background = dustFor(x, y, radius);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      paintBeam(`${restX}%`, `${restY}%`, size);
      return;
    }

    function restingPoint() {
      return {
        x: (root.clientWidth * restX) / 100,
        y: (root.clientHeight * restY) / 100,
      };
    }

    function toLocal(event: PointerEvent) {
      const bounds = root.getBoundingClientRect();
      const sx = bounds.width > 0 ? root.clientWidth / bounds.width : 1;
      const sy = bounds.height > 0 ? root.clientHeight / bounds.height : 1;
      return {
        x: (event.clientX - bounds.left) * sx,
        y: (event.clientY - bounds.top) * sy,
      };
    }

    const ease = makeEase(transition.ease);
    const durMs = Math.max(0.001, duration) * 1000;
    const current = restingPoint();
    const target = { ...current };
    let presence = mode === "onImage" ? 1 : 0;
    let animFrom = presence;
    let animTo = presence;
    let animStart = 0;
    let hovering = false;
    let raf = 0;
    let last = 0;
    let alive = true;
    let prevTx = current.x;
    let prevTy = current.y;
    let speedBoost = 0;

    function onMove(event: PointerEvent) {
      const { x, y } = toLocal(event);
      if (!hovering && presence < 0.01) {
        current.x = x;
        current.y = y;
      }
      hovering = true;
      target.x = x;
      target.y = y;
    }

    function onLeave(event: PointerEvent) {
      if (pointerScope === "window") {
        const next = event.relatedTarget;
        if (next && next instanceof Node && document.documentElement.contains(next)) {
          return;
        }
      }
      hovering = false;
      if (mode === "onImage") {
        const rest = restingPoint();
        target.x = rest.x;
        target.y = rest.y;
      } else {
        const { x, y } = toLocal(event);
        current.x = x;
        current.y = y;
        target.x = x;
        target.y = y;
      }
    }

    function frame(time: number) {
      if (!alive) return;
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 1 / 60;
      last = time;
      const follow = 1 - Math.pow(1 - FOLLOW / 100, dt * 60);
      current.x += (target.x - current.x) * follow;
      current.y += (target.y - current.y) * follow;

      const move = Math.hypot(target.x - prevTx, target.y - prevTy);
      prevTx = target.x;
      prevTy = target.y;
      const pxPerSec = move / Math.max(dt, 1 / 120);
      const wantBoost = Math.min(0.14, (pxPerSec / 2200) * 0.14);
      speedBoost += (wantBoost - speedBoost) * Math.min(1, dt * 7);

      const want = mode === "onImage" || hovering ? 1 : 0;
      if (want !== animTo) {
        animFrom = presence;
        animTo = want;
        animStart = time;
      }
      const p = Math.min(1, (time - animStart) / durMs);
      presence = animFrom + (animTo - animFrom) * ease(p);

      const radius = size * presence * (1 + speedBoost);
      paintBeam(`${current.x}px`, `${current.y}px`, radius);
      raf = requestAnimationFrame(frame);
    }

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        if (hovering) return;
        const rest = restingPoint();
        target.x = rest.x;
        target.y = rest.y;
      });
      ro.observe(root);
    }

    const moveTarget: EventTarget =
      pointerScope === "window" ? window : root;
    const leaveTarget: EventTarget =
      pointerScope === "window" ? document.documentElement : root;
    moveTarget.addEventListener("pointermove", onMove as EventListener);
    leaveTarget.addEventListener("pointerleave", onLeave as EventListener);
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      moveTarget.removeEventListener("pointermove", onMove as EventListener);
      leaveTarget.removeEventListener("pointerleave", onLeave as EventListener);
    };
  }, [size, mode, restX, restY, duration, easeToken, pointerScope]);

  const restingMask =
    mode === "onImage" ? maskFor(`${restX}%`, `${restY}%`, size) : "none";
  const src = resolveImageSrc(image);
  const alt = typeof image === "object" ? (image.alt ?? "") : "";
  const srcSet = typeof image === "object" ? image.srcSet : undefined;

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        ...style,
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {src ? (
        // Spotlight mask needs a plain img; next/image would wrap the layer.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          srcSet={srcSet}
          alt={alt}
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: fit,
            objectPosition:
              fit === "cover" ? `center ${clampFocus(focusY)}%` : "center",
            borderRadius: rounded,
            userSelect: "none",
          }}
        />
      ) : null}
      <div
        ref={veilRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background: veilColor,
          opacity: 1 - visibility / 100,
          borderRadius: rounded,
          pointerEvents: "none",
          maskImage: restingMask,
          WebkitMaskImage: restingMask,
        }}
      />
      {children}
      {children ? (
        <div
          ref={coverRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            background: veilColor,
            borderRadius: rounded,
            pointerEvents: "none",
            maskImage: restingMask,
            WebkitMaskImage: restingMask,
          }}
        />
      ) : null}
      <div
        ref={glowRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
          background:
            mode === "onImage" ? dustFor(`${restX}%`, `${restY}%`, size) : "none",
        }}
      />
    </div>
  );
}
