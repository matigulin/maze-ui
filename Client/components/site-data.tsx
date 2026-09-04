"use client";

import { createContext, useContext, type ReactNode } from "react";
import { CATEGORIES, STORE, BRANDS } from "@/lib/data";
import type { SiteChrome } from "@/lib/site-source";

const defaultChrome: SiteChrome = {
  categories: CATEGORIES.map((c) => ({
    slug: c.slug,
    name: c.name,
    count: c.count,
    icon: c.icon,
    tint: c.tint as [string, string],
  })),
  store: STORE,
  partnerBrands: BRANDS,
};

const SiteDataContext = createContext<SiteChrome>(defaultChrome);

export function SiteDataProvider({
  value,
  children,
}: {
  value: SiteChrome;
  children: ReactNode;
}) {
  return (
    <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
  );
}

export function useSiteData() {
  return useContext(SiteDataContext);
}
