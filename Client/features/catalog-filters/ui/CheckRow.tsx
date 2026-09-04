"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckRowProps = {
  label: string;
  checked: boolean;
  onClick: () => void;
};

export function CheckRow({ label, checked, onClick }: CheckRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className="flex w-full items-center gap-2.5 rounded-lg py-1 text-left text-sm text-muted transition-colors hover:text-ink cursor-pointer"
    >
      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
          checked
            ? "border-cyan bg-cyan text-[#04121a]"
            : "border-line bg-white/[0.02]",
        )}
      >
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      <span className="min-w-0 break-words">{label}</span>
    </button>
  );
}
