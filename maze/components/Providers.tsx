"use client";

import { type ReactNode } from "react";
import { CartProvider } from "./store";
import { ModalProvider, useModal } from "./modals";
import { MiniCart } from "./MiniCart";
import { AuthModal } from "./AuthModal";
import { TradeInModal } from "./TradeInModal";
import { SiteDataProvider } from "./site-data";
import type { SiteChrome } from "@/lib/site-source";

function ModalsHost() {
  const { modal, close } = useModal();
  return (
    <>
      <AuthModal open={modal === "auth"} onClose={close} />
      <TradeInModal open={modal === "tradein"} onClose={close} />
      <MiniCart />
    </>
  );
}

export function Providers({
  children,
  siteData,
}: {
  children: ReactNode;
  siteData: SiteChrome;
}) {
  return (
    <SiteDataProvider value={siteData}>
      <CartProvider>
        <ModalProvider>
          {children}
          <ModalsHost />
        </ModalProvider>
      </CartProvider>
    </SiteDataProvider>
  );
}
