"use client";

import { useCallback } from "react";
import { MiniCart } from "./MiniCart";
import { AuthModal, useUserAuth } from "@/features/auth";
import { useCart } from "@/features/cart";
import { TradeInModal } from "./TradeInModal";
import { useModal } from "./modals";

/** Composition: модалки витрины + сброс pending-add при отмене входа. */
export function StorefrontModals() {
  const { modal, close } = useModal();
  const { isAuthenticated } = useUserAuth();
  const { dismissPendingAdd } = useCart();

  const handleAuthClose = useCallback(() => {
    close();
    if (!isAuthenticated) dismissPendingAdd();
  }, [close, isAuthenticated, dismissPendingAdd]);

  return (
    <>
      <AuthModal open={modal === "auth"} onClose={handleAuthClose} />
      <TradeInModal open={modal === "tradein"} onClose={close} />
      <MiniCart />
    </>
  );
}
