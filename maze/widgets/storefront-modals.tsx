"use client";

import { useCallback } from "react";
import { MiniCart } from "@/components/MiniCart";
import { TradeInModal } from "@/components/TradeInModal";
import { useModal } from "@/components/modals";
import { AuthModal, type AuthCloseReason } from "@/features/auth";
import { useCart } from "@/features/cart";

/** Composition-root: модалки витрины + сброс pending-add только при отмене входа. */
export function StorefrontModals() {
  const { modal, close } = useModal();
  const { dismissPendingAdd } = useCart();

  const handleAuthClose = useCallback(
    (reason: AuthCloseReason = "dismiss") => {
      close();
      // После успешного SMS isAuthenticated ещё может быть false в этом тике —
      // сбрасываем pending только при явной отмене (крестик / Escape / фон).
      if (reason !== "authenticated") dismissPendingAdd();
    },
    [close, dismissPendingAdd],
  );

  return (
    <>
      <AuthModal open={modal === "auth"} onClose={handleAuthClose} />
      <TradeInModal open={modal === "tradein"} onClose={close} />
      <MiniCart />
    </>
  );
}
