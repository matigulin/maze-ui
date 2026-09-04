"use client";

import { useEffect, useId, useState } from "react";
import { FilterGroup } from "./FilterGroup";
import { PriceRangeSlider } from "./PriceRangeSlider";

type PriceFilterProps = {
  min: number;
  max: number;
  /** Потолок каталога (самая дорогая позиция) */
  ceiling: number;
  onMinChange: (next: number) => void;
  onMaxChange: (next: number) => void;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat("ru-RU")
    .format(Math.max(0, Math.round(value)))
    .replace(/\s/g, "\u00A0");
}

function parseAmount(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return Number(digits);
}

function PriceField({
  label,
  value,
  onCommit,
  disabled,
}: {
  label: string;
  value: number;
  onCommit: (next: number) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [text, setText] = useState(() => formatAmount(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(formatAmount(value));
  }, [value, focused]);

  function commit() {
    const parsed = parseAmount(text);
    const next = parsed == null ? value : parsed;
    onCommit(next);
    setText(formatAmount(next));
  }

  return (
    <label
      htmlFor={id}
      className="flex min-w-0 flex-1 cursor-text items-center gap-1 rounded-xl border border-line bg-white/[0.03] px-2 py-2 transition-colors focus-within:border-accent/50"
    >
      <span className="shrink-0 text-[10px] uppercase tracking-wider text-faint">
        {label}
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={(e) => {
          setFocused(true);
          e.target.select();
        }}
        onBlur={() => {
          setFocused(false);
          commit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        className="min-w-0 flex-1 bg-transparent text-[13px] font-medium tabular-nums tracking-tight text-ink outline-none disabled:opacity-50"
        aria-label={label}
      />
      <span className="shrink-0 text-[13px] tabular-nums text-muted" aria-hidden>
        ₽
      </span>
    </label>
  );
}

/**
 * Цена как у DNS / М.Видео: поля «от» / «до» + ползунок максимума.
 * Ползунок не меняем — только синхронизируем с «до».
 */
export function PriceFilter({
  min,
  max,
  ceiling,
  onMinChange,
  onMaxChange,
}: PriceFilterProps) {
  const safeCeiling = Number.isFinite(ceiling) && ceiling > 0 ? ceiling : 0;

  function commitMin(raw: number) {
    const next = Math.min(Math.max(0, raw), safeCeiling);
    if (next > max) onMaxChange(next);
    onMinChange(next);
  }

  function commitMax(raw: number) {
    const next = Math.min(Math.max(0, raw), safeCeiling);
    if (next < min) onMinChange(next);
    onMaxChange(next);
  }

  return (
    <FilterGroup title="Цена">
      <div className="px-0.5">
        <div className="mb-3 flex items-stretch gap-2">
          <PriceField
            label="от"
            value={min}
            onCommit={commitMin}
            disabled={safeCeiling <= 0}
          />
          <PriceField
            label="до"
            value={max}
            onCommit={commitMax}
            disabled={safeCeiling <= 0}
          />
        </div>
        <PriceRangeSlider
          value={max}
          max={safeCeiling}
          onChange={commitMax}
        />
      </div>
    </FilterGroup>
  );
}
