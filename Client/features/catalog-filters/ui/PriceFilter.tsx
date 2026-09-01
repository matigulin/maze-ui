"use client";

import { formatPrice } from "@/lib/utils";
import { FilterGroup } from "./FilterGroup";
import { PriceRangeSlider } from "./PriceRangeSlider";

type PriceFilterProps = {
  price: number;
  maxPrice: number;
  onChange: (next: number) => void;
};

export function PriceFilter({ price, maxPrice, onChange }: PriceFilterProps) {
  return (
    <FilterGroup title="Цена">
      <div className="px-1">
        <div className="mb-3 flex items-center justify-between gap-2 text-sm">
          <span className="text-faint">0 ₽</span>
          <span className="rounded-lg border border-line bg-white/[0.03] px-2.5 py-1 font-medium tabular-nums text-cyan">
            до {formatPrice(price)}
          </span>
        </div>
        <PriceRangeSlider value={price} max={maxPrice} onChange={onChange} />
      </div>
    </FilterGroup>
  );
}
