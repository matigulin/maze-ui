import type { ReactNode } from "react";

type FilterGroupProps = {
  title: string;
  children: ReactNode;
};

export function FilterGroup({ title, children }: FilterGroupProps) {
  return (
    <div>
      <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-faint">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
