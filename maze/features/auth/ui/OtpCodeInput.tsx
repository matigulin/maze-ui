"use client";

import {
  useEffect,
  useId,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import { digitsOnly } from "@/lib/phone";

const LENGTH = 4;

export function OtpCodeInput({
  value,
  onChange,
  disabled,
  autoFocus,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const id = useId();
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = digitsOnly(value).padEnd(LENGTH, " ").slice(0, LENGTH).split("");

  useEffect(() => {
    if (!autoFocus) return;
    refs.current[0]?.focus();
  }, [autoFocus]);

  function setAt(index: number, char: string) {
    const next = digitsOnly(value).split("");
    while (next.length < LENGTH) next.push("");
    next[index] = char;
    onChange(next.join("").slice(0, LENGTH));
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = digitsOnly(e.clipboardData.getData("text")).slice(0, LENGTH);
    if (!pasted) return;
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, LENGTH - 1);
    refs.current[focusIdx]?.focus();
  }

  function onKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const current = digitsOnly(value);
      if (current[index]) {
        setAt(index, "");
        return;
      }
      if (index > 0) {
        setAt(index - 1, "");
        refs.current[index - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={`${id}-0`}
        className="block text-xs font-medium uppercase tracking-wider text-muted"
      >
        Код из SMS
        <span className="ml-1.5 font-normal normal-case tracking-normal text-faint">
          · 4 цифры
        </span>
      </label>
      <div className="flex justify-between gap-2 sm:gap-3">
        {Array.from({ length: LENGTH }, (_, index) => {
          const raw = digits[index] ?? "";
          const char = raw.trim();
          return (
            <input
              key={index}
              id={`${id}-${index}`}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              disabled={disabled}
              value={char}
              aria-label={`Цифра ${index + 1}`}
              onPaste={onPaste}
              onKeyDown={(e) => onKeyDown(index, e)}
              onChange={(e) => {
                const d = digitsOnly(e.target.value).slice(-1);
                if (!d) {
                  setAt(index, "");
                  return;
                }
                setAt(index, d);
                if (index < LENGTH - 1) {
                  refs.current[index + 1]?.focus();
                }
              }}
              className={cn(
                "h-14 w-full rounded-xl border bg-bg-2/60 text-center font-display text-2xl font-semibold text-ink outline-none transition-colors tabular-nums",
                "border-line focus:border-cyan/70",
                disabled && "opacity-50",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
