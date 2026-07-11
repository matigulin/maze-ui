"use client";

import { type ReactNode } from "react";
import { CartProvider } from "./store";
import { ModalProvider } from "./modals";
import { SiteDataProvider } from "./site-data";
import { StaffAuthProvider } from "./staff/StaffAuthProvider";
import type { SiteChrome } from "@/lib/site-source";

export function Providers({
  children,
  siteData,
}: {
  children: ReactNode;
  siteData: SiteChrome;
}) {
  return (
    <SiteDataProvider value={siteData}>
      <StaffAuthProvider>
        <CartProvider>
          <ModalProvider>{children}</ModalProvider>
        </CartProvider>
      </StaffAuthProvider>
    </SiteDataProvider>
  );
}
