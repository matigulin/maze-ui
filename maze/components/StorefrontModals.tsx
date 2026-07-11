"use client";

import { MiniCart } from "./MiniCart";
import { AuthModal } from "./AuthModal";
import { TradeInModal } from "./TradeInModal";
import { useModal } from "./modals";

export function StorefrontModals() {
  const { modal, close } = useModal();
  return (
    <>
      <AuthModal open={modal === "auth"} onClose={close} />
      <TradeInModal open={modal === "tradein"} onClose={close} />
      <MiniCart />
    </>
  );
}
