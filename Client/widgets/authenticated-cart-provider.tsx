"use client";

import { useMemo, type ReactNode } from "react";
import { useModal } from "@/components/modals";
import { CartProvider, type CartAuthAdapter } from "@/features/cart";
import { useUserAuth } from "@/features/auth";

/** Composition-root: прокидывает auth в CartProvider (feature cart не знает про features/auth). */
export function AuthenticatedCartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { ready, isAuthenticated, user, ensureAccessToken } = useUserAuth();
  const { open } = useModal();

  const auth = useMemo<CartAuthAdapter>(
    () => ({
      ready,
      isAuthenticated,
      userId: user?.id ?? null,
      checkoutContact: user
        ? {
            userId: user.id,
            firstName: user.firstName,
            phone: user.phone,
          }
        : null,
      ensureAccessToken,
      onRequireAuth: () => open("auth"),
    }),
    [ready, isAuthenticated, user, ensureAccessToken, open],
  );

  return <CartProvider auth={auth}>{children}</CartProvider>;
}
