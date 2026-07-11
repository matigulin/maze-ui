"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

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
    primary:
      "bg-cyan/90 text-bg hover:bg-cyan disabled:opacity-50",
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-bg-2/60 px-4 py-3 text-[15px] text-ink outline-none focus:border-cyan/70 focus:ring-2 focus:ring-cyan/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
