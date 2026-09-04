"use client";

import { useCallback, useRef, useState } from "react";
import { MapPin, Phone } from "lucide-react";
import { useSiteData } from "@/components/site-data";
import styles from "./not-found-visit-card.module.css";

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function mapHref(city: string, address: string, lat: number, lng: number) {
  const query = encodeURIComponent(`${city}, ${address}`);
  return `https://yandex.ru/maps/?ll=${lng}%2C${lat}&z=16&text=${query}`;
}

function streetLine(address: string) {
  const trimmed = address.trim();
  if (/^(ул\.|улица)\s/i.test(trimmed)) return trimmed;
  return `ул. ${trimmed}`;
}

function metroLine(metro: string) {
  const raw = metro.replace(/^метро\s+/i, "").trim();
  return `(метро ${raw})`;
}

export function NotFoundVisitCard() {
  const { store } = useSiteData();
  const maps = mapHref(store.city, store.address, store.mapLat, store.mapLng);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = el.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width;
    const py = (event.clientY - bounds.top) / bounds.height;
    setTilt({ x: (0.5 - py) * 10, y: (px - 0.5) * 12 });
  }, []);

  const onLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return (
    <div className={styles.shell}>
      <article
        ref={cardRef}
        className={styles.card}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <div className={styles.face}>
          <svg
            className={styles.mark}
            viewBox="12 8 24 28"
            fill="none"
            aria-hidden
          >
            <path
              d="M23.65 33 H35 L23.65 9.5 L12.3 33 H16.85 L23.65 19.5 L30.45 33"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <div className={styles.glare} />

          <div className="relative flex flex-1 items-center justify-center px-4 pt-4">
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              className="relative grid size-[5.6rem] place-items-center sm:size-[6.4rem]"
              aria-label="Открыть магазин на карте"
            >
              {/* QR is a generated SVG; next/image is unnecessary here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/maze-card-qr.svg"
                alt=""
                className="size-full"
                draggable={false}
              />
              <span className="absolute grid size-7 place-items-center rounded-sm bg-[#000000] sm:size-8">
                <svg
                  viewBox="12 8 24 28"
                  className="size-5 text-accent sm:size-6"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M23.65 33 H35 L23.65 9.5 L12.3 33 H16.85 L23.65 19.5 L30.45 33"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </a>
          </div>

          <div className="relative mt-auto flex items-end justify-between gap-3 px-3.5 pb-3 pt-1 text-left text-[10px] leading-snug tracking-wide text-accent sm:px-4 sm:pb-3.5 sm:text-[11px]">
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 min-w-0 items-start gap-1.5 hover:text-ink"
            >
              <MapPin size={13} className="mt-0.5 shrink-0" aria-hidden />
              <span>
                {store.city},
                <br />
                {streetLine(store.address)}
                <br />
                {metroLine(store.metro)}
              </span>
            </a>
            <a
              href={phoneHref(store.phone)}
              className="flex min-h-11 shrink-0 items-center gap-1.5 hover:text-ink"
            >
              <Phone size={13} className="shrink-0" aria-hidden />
              <span>{store.phone}</span>
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
