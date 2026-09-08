"use client";

import { RANGE_THUMB_PX, rangeFillWidth } from "../lib/range-track-fill";

type PriceRangeSliderProps = {
  value: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  "aria-label"?: string;
};

/** Заливка трека — отдельный слой до центра thumb; input только для жеста. */
export function PriceRangeSlider({
  value,
  max,
  step = 1000,
  onChange,
  "aria-label": ariaLabel = "Максимальная цена",
}: PriceRangeSliderProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  const safeValue =
    safeMax > 0 ? Math.min(Math.max(0, value), safeMax) : 0;
  const fillWidth =
    safeMax > 0 ? rangeFillWidth(safeValue, safeMax) : "0%";

  return (
    <div className="relative w-full" style={{ height: RANGE_THUMB_PX }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--color-line)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
        style={{
          width: fillWidth,
          background:
            "linear-gradient(90deg, var(--color-cyan), var(--color-violet))",
        }}
      />
      <input
        type="range"
        min={0}
        max={safeMax || 1}
        step={step}
        value={safeValue}
        disabled={safeMax <= 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="maze-range-input absolute inset-0 z-10 w-full"
        aria-label={ariaLabel}
      />
    </div>
  );
}
