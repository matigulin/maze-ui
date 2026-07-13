"use client";

import { type ReactNode } from "react";
import { useModal } from "@/components/modals";
import { CartProvider } from "@/features/cart";
import { useUserAuth } from "@/features/auth";

/** Composition-root: прокидывает auth в CartProvider (feature cart не знает про features/auth). */
export function AuthenticatedCartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { ready, isAuthenticated, user, ensureAccessToken } = useUserAuth();
  const { open } = useModal();

  return (
    <CartProvider
      auth={{
        ready,
        isAuthenticated,
        userId: user?.id ?? null,
        ensureAccessToken,
        onRequireAuth: () => open("auth"),
      }}
    >
      {children}
    </CartProvider>
  );
}
