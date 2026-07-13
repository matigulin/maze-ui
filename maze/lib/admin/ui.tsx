"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-xl tracking-wide text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AdminAlert({
  tone = "error",
  children,
}: {
  tone?: "error" | "ok" | "info";
  children: ReactNode;
}) {
  const styles =
    tone === "error"
      ? "border-magenta/30 bg-magenta/10"
      : tone === "ok"
        ? "border-cyan/30 bg-cyan/10"
        : "border-line bg-bg-2";
  return (
    <p role="status" className={cn("rounded-xl border px-3 py-2 text-sm text-ink", styles)}>
      {children}
    </p>
  );
}

export function AdminButton({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger" | "secondary";
}) {
  const styles = {
    primary: "bg-cyan/90 text-bg hover:bg-cyan disabled:opacity-50",
    secondary:
      "border border-line bg-bg-2 text-ink hover:border-cyan/40 disabled:opacity-50",
    ghost: "text-muted hover:bg-bg-2 hover:text-ink disabled:opacity-50",
    danger:
      "border border-magenta/40 bg-magenta/10 text-ink hover:bg-magenta/20 disabled:opacity-50",
  }[variant];

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed",
        styles,
        className,
      )}
      {...props}
    />
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export function AdminTh({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-line bg-panel/80 px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-faint",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function AdminTd({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-line/70 px-4 py-3 text-ink", className)}>{children}</td>;
}

export function AdminModal({
  open,
  title,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div
        className={cn(
          "my-8 w-full rounded-2xl border border-line bg-panel shadow-2xl",
          wide ? "max-w-2xl" : "max-w-lg",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-sm tracking-wide text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-muted hover:bg-bg-2 hover:text-ink"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function AdminCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-line accent-cyan"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function AdminTextarea({
  label,
  value,
  onChange,
  rows = 4,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </label>
      <textarea
        className="w-full rounded-xl border border-line bg-bg-2/60 px-4 py-3 text-[15px] text-ink placeholder:text-faint outline-none transition-colors focus:border-cyan/70 focus:ring-2 focus:ring-cyan/20"
        rows={rows}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function AdminSelect({
  label,
  value,
  onChange,
  options,
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string; detail?: string }>;
  required?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected =
    options.find((opt) => opt.value === value) ??
    options[0] ?? { value: "", label: "—" };

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={cn("relative space-y-1.5", className)} ref={rootRef}>
      <label
        id={`${listId}-label`}
        className="block text-xs font-medium uppercase tracking-wider text-muted"
      >
        {label}
      </label>

      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      >
        {options.map((opt) => (
          <option key={opt.value || "__empty"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby={`${listId}-label`}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border bg-bg-2/60 px-3.5 py-3 text-left text-[15px] outline-none transition-colors cursor-pointer",
            open
              ? "border-cyan/70 ring-2 ring-cyan/20"
              : "border-line hover:border-white/20 focus:border-cyan/70 focus:ring-2 focus:ring-cyan/20",
          )}
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-ink">{selected.label}</span>
            {selected.detail && (
              <span className="block truncate text-xs text-faint">{selected.detail}</span>
            )}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-faint transition-transform duration-200",
              open && "rotate-180 text-cyan",
            )}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              id={listId}
              role="listbox"
              aria-labelledby={`${listId}-label`}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute left-0 right-0 z-40 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-line bg-panel/95 p-1.5 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.75)] backdrop-blur-xl"
            >
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <li
                    key={option.value || "__empty"}
                    role="option"
                    aria-selected={active}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors cursor-pointer",
                        active
                          ? "bg-cyan/10 text-ink"
                          : "text-ink hover:bg-white/[0.04]",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {option.label}
                        </span>
                        {option.detail && (
                          <span className="block truncate text-xs text-faint">
                            {option.detail}
                          </span>
                        )}
                      </span>
                      {active && <Check size={15} className="shrink-0 text-cyan" />}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}

export function errorMessage(err: unknown, fallback = "Ошибка запроса") {
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
