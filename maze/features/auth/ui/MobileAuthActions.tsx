"use client";

import Link from "next/link";
import { LogIn, User } from "lucide-react";
import { useModal } from "@/components/modals";
import { useUserAuth } from "../model/user-auth-provider";

type MobileAuthActionsProps = {
  onNavigate?: () => void;
};

/** Карточка аккаунта / входа в мобильном drawer. */
export function MobileAuthActions({ onNavigate }: MobileAuthActionsProps) {
  const { ready, isAuthenticated, displayName } = useUserAuth();
  const { open } = useModal();

  if (!ready) return null;

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => {
          open("auth");
          onNavigate?.();
        }}
        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white/[0.03] px-3.5 py-3 text-left transition-colors hover:border-cyan/40 hover:bg-white/5 cursor-pointer"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan/15 text-cyan">
          <LogIn size={18} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">
            Войти в MAZE ID
          </span>
          <span className="mt-0.5 block text-xs text-faint">
            Профиль, заказы и избранное
          </span>
        </span>
      </button>
    );
  }

  return (
    <Link
      href="/account"
      onClick={onNavigate}
      className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white/[0.03] px-3.5 py-3 text-left transition-colors hover:border-cyan/40 hover:bg-white/5"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan/15 text-cyan">
        <User size={18} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[11px] uppercase tracking-wide text-faint">
          MAZE ID{displayName ? ` · ${displayName}` : ""}
        </span>
        <span className="mt-0.5 block text-sm font-medium text-ink">
          Личный кабинет
        </span>
      </span>
    </Link>
  );
}
