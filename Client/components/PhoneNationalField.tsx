"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  digitsOnly,
  getPhoneFieldError,
  maskNationalPhoneInput,
} from "@/lib/phone";

export function PhoneNationalField({
  value,
  onChange,
  disabled,
  id,
  autoFocus,
  forceError = false,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  id?: string;
  autoFocus?: boolean;
  forceError?: boolean;
}) {
  const gen = useId();
  const fieldId = id ?? gen;
  const [blurred, setBlurred] = useState(false);

  const message = getPhoneFieldError(value, { force: forceError, blurred });
  const invalid = Boolean(message);
  const valid = digitsOnly(value).length === 10 && !invalid;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="block text-xs font-medium uppercase tracking-wider text-muted"
      >
        Телефон
      </label>
      <div
        className={cn(
          "flex w-full items-center gap-1.5 rounded-xl border bg-bg-2/60 px-4 transition-colors outline-none",
          invalid
            ? "border-magenta/55 focus-within:border-magenta/80"
            : valid
              ? "border-cyan/45 focus-within:border-cyan/70"
              : "border-line focus-within:border-cyan/70",
        )}
      >
        <span className="shrink-0 text-[15px] text-ink">+7</span>
        <input
          id={fieldId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          placeholder="(999) 123-45-67"
          value={value}
          onChange={(e) => onChange(maskNationalPhoneInput(e.target.value))}
          onBlur={() => setBlurred(true)}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={message ? `${fieldId}-error` : undefined}
          className="input-inset min-w-0 flex-1 border-0 bg-transparent py-3 text-[15px] text-ink placeholder:text-faint shadow-none outline-none"
        />
        {valid ? (
          <CircleCheck size={16} className="shrink-0 text-cyan" aria-hidden />
        ) : null}
      </div>

      <AnimatePresence initial={false} mode="wait">
        {message ? (
          <motion.p
            key={message}
            id={`${fieldId}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -2, height: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex items-start gap-1.5 overflow-hidden text-[13px] leading-snug text-magenta"
          >
            <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden />
            <span>{message}</span>
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
