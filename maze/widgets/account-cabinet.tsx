"use client";

import { useModal } from "@/components/modals";
import { AccountClient } from "@/features/account";
import { useCart } from "@/features/cart";
import { useUserAuth } from "@/features/auth";

type Tab = "profile" | "orders" | "wishlist" | "addresses" | "company";

/** Composition-root: склеивает account UI с auth/cart/modals без cross-feature импортов внутри features. */
export function AccountCabinet({ initialTab = "profile" }: { initialTab?: Tab }) {
  const { wishlist } = useCart();
  const { ready, isAuthenticated, ensureAccessToken } = useUserAuth();
  const { open } = useModal();

  return (
    <AccountClient
      initialTab={initialTab}
      wishlistIds={wishlist}
      ready={ready}
      isAuthenticated={isAuthenticated}
      ensureAccessToken={ensureAccessToken}
      onLogin={() => open("auth")}
    />
  );
}
