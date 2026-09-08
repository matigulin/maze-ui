"use client";

import { type ReactNode } from "react";
import { ModalProvider } from "./modals";
import { SiteDataProvider } from "./site-data";
import { StaffAuthProvider } from "./staff/StaffAuthProvider";
import { UserAuthProvider } from "@/features/auth";
import { AuthenticatedCartProvider } from "@/widgets/authenticated-cart-provider";
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
            <AuthenticatedCartProvider>{children}</AuthenticatedCartProvider>
          </ModalProvider>
        </UserAuthProvider>
      </StaffAuthProvider>
    </SiteDataProvider>
  );
}
