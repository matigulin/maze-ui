"use client";

import { useCallback, useEffect, useRef } from "react";
import { MiniCart } from "@/components/MiniCart";
import { TradeInModal } from "@/components/TradeInModal";
import { useModal } from "@/components/modals";
import { AuthModal, useUserAuth } from "@/features/auth";
import { useCart } from "@/features/cart";

/** Composition-root: модалки витрины + сброс pending-add при отмене входа. */
export function StorefrontModals() {
  const { modal, close } = useModal();
  const { isAuthenticated } = useUserAuth();
  const { dismissPendingAdd } = useCart();
  const isAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const handleAuthClose = useCallback(() => {
    close();
    if (!isAuthenticatedRef.current) dismissPendingAdd();
  }, [close, dismissPendingAdd]);

  return (
    <>
      <AuthModal open={modal === "auth"} onClose={handleAuthClose} />
      <TradeInModal open={modal === "tradein"} onClose={close} />
      <MiniCart />
    </>
  );
}
