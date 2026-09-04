"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_VIDEO_SRC } from "../lib/constants";

/**
 * Видеофон hero: object-cover + object-center — без растягивания пропорций.
 * Пауза вне viewport — меньше нагрузка на GPU при скролле 120Hz.
 */
export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => {
      setReady(true);
      void video.play().catch(() => {});
    };

    if (video.readyState >= 2) {
      onReady();
    } else {
      video.addEventListener("loadeddata", onReady);
    }

    return () => video.removeEventListener("loadeddata", onReady);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "10% 0px", threshold: 0.05 },
    );

    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <video
        key={HERO_VIDEO_SRC}
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      >
        <source src={HERO_VIDEO_SRC} type="video/mp4" />
      </video>
    </div>
  );
}
