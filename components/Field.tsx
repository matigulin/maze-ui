"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, type ReactNode, useId } from "react";

export const fieldCls =
  "w-full rounded-xl border border-line bg-bg-2/60 px-4 py-3 text-[15px] text-ink placeholder:text-faint outline-none transition-colors focus:border-cyan/70 focus:ring-2 focus:ring-cyan/20";

export function Field({
  label,
  hint,
  className,
  id,
  ...props
}: { label: string; hint?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  const gen = useId();
  const fid = id ?? gen;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fid}
        className="block text-xs font-medium uppercase tracking-wider text-muted"
      >
        {label}
      </label>
      <input id={fid} className={cn(fieldCls, className)} {...props} />
      {hint && <p className="text-xs text-faint">{hint}</p>}
    </div>
  );
}
