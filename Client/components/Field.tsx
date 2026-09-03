"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, type ReactNode, useId } from "react";

export const fieldCls =
  "w-full rounded-2xl border border-line bg-bg-2 px-4 py-3 text-[15px] text-ink placeholder:text-faint outline-none transition-colors focus:border-accent/70 focus-visible:outline-none";

export function Field({
  label,
  labelNote,
  hint,
  className,
  id,
  ...props
}: {
  label: string;
  labelNote?: ReactNode;
  hint?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  const gen = useId();
  const fid = id ?? gen;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fid}
        className="block text-xs font-medium uppercase tracking-wider text-muted"
      >
        {label}
        {labelNote && (
          <span className="ml-1.5 font-normal normal-case tracking-normal text-faint">
            · {labelNote}
          </span>
        )}
      </label>
      <input id={fid} className={cn(fieldCls, className)} {...props} />
      {hint && <p className="text-xs text-faint">{hint}</p>}
    </div>
  );
}
