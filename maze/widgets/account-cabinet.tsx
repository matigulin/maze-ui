"use client";

import { useCallback } from "react";
import { useModal } from "@/components/modals";
import { AccountClient } from "@/features/account";
import { AccountOrdersPanel } from "@/features/account-orders";
import { useCart } from "@/features/cart";
import { LogoutButton, useUserAuth } from "@/features/auth";
import type { UserProfile } from "@/entities/user";

type Tab = "profile" | "orders" | "wishlist" | "addresses" | "company";

/** Composition-root: склеивает account UI с auth/cart/orders/modals. */
export function AccountCabinet({ initialTab = "profile" }: { initialTab?: Tab }) {
  const { wishlist } = useCart();
  const { ready, isAuthenticated, ensureAccessToken, syncUserProfile } =
    useUserAuth();
  const { open } = useModal();

  const onProfileSaved = useCallback(
    (profile: UserProfile) => {
      syncUserProfile({
        id: profile.id,
        phone: profile.phone,
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
    },
    [syncUserProfile],
  );

  return (
    <AccountClient
      initialTab={initialTab}
      wishlistIds={wishlist}
      ready={ready}
      isAuthenticated={isAuthenticated}
      ensureAccessToken={ensureAccessToken}
      onLogin={() => open("auth")}
      onProfileSaved={onProfileSaved}
      ordersPanel={
        <AccountOrdersPanel ensureAccessToken={ensureAccessToken} />
      }
      profileFooterActions={
        <LogoutButton className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-sm text-muted transition-colors hover:border-magenta/50 hover:bg-magenta/10 hover:text-magenta cursor-pointer" />
      }
    />
  );
}
