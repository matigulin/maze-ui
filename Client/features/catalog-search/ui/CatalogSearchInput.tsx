"use client";

import { Search } from "lucide-react";
import { BRANDS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { RotatingBrandHint } from "./RotatingBrandHint";

type CatalogSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  brands: string[];
  className?: string;
  inputClassName?: string;
  "aria-label"?: string;
};

export function CatalogSearchInput({
  value,
  onChange,
  brands,
  className,
  inputClassName,
  "aria-label": ariaLabel = "Поиск",
}: CatalogSearchInputProps) {
  const showHint = value.trim().length === 0;
  const hintBrands = brands.length > 0 ? brands : [...BRANDS];

  return (
    <div className={cn("relative", className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-4 top-1/2 z-[3] -translate-y-1/2 text-faint"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=""
        aria-label={ariaLabel}
        className={cn(
          "relative z-[1] w-full rounded-full border border-line bg-white/[0.03] py-2.5 pl-11 pr-4 text-sm text-ink outline-none transition-colors focus:border-accent/60 focus:bg-white/[0.05]",
          inputClassName,
        )}
      />
      {showHint && (
        <div
          className="pointer-events-none absolute inset-y-0 left-11 right-4 z-[2] flex items-center overflow-hidden text-sm text-faint"
          aria-hidden
        >
          <RotatingBrandHint brands={hintBrands} />
        </div>
      )}
    </div>
  );
}
