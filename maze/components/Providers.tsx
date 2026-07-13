"use client";

import { type ReactNode } from "react";
import { CartProvider } from "@/features/cart";
import { ModalProvider } from "./modals";
import { SiteDataProvider } from "./site-data";
import { StaffAuthProvider } from "./staff/StaffAuthProvider";
import { UserAuthProvider } from "@/features/auth";
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
        <UserAuthProvider>
          <ModalProvider>
            <CartProvider>{children}</CartProvider>
          </ModalProvider>
        </UserAuthProvider>
      </StaffAuthProvider>
    </SiteDataProvider>
  );
}
