"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_VIDEO_SRC } from "../lib/constants";

/**
 * Видеофон hero: object-cover + object-center — без растягивания пропорций.
 */
export function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
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
      return;
    }

    video.addEventListener("loadeddata", onReady);
    return () => video.removeEventListener("loadeddata", onReady);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
        preload="auto"
        aria-hidden
      >
        <source src={HERO_VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Зелёный тинт поверх видео */}
      <div
        className="absolute inset-0 bg-bg/65"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg/80"
        aria-hidden
      />
    </div>
  );
}
