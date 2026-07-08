"use client";

import { type ReactNode } from "react";
import { CartProvider } from "./store";
import { ModalProvider, useModal } from "./modals";
import { MiniCart } from "./MiniCart";
import { AuthModal } from "./AuthModal";
import { TradeInModal } from "./TradeInModal";

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

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <ModalProvider>
        {children}
        <ModalsHost />
      </ModalProvider>
    </CartProvider>
  );
}
