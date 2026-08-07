"use client";

import Link from "next/link";
import { LogIn, User } from "lucide-react";
import { useModal } from "@/components/modals";
import { cn } from "@/lib/utils";
import { useUserAuth } from "../model/user-auth-provider";
import { LogoutButton } from "./LogoutButton";

function AuthIconButton({
  children,
  label,
  onClick,
  href,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const cls = cn(
    "relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/5 hover:text-ink cursor-pointer",
    className,
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {children}
    </button>
  );
}

export function HeaderAuthActions() {
  const { ready, isAuthenticated } = useUserAuth();
  const { open } = useModal();

  if (!ready) {
    return (
      <AuthIconButton label="Войти" className="pointer-events-none opacity-40">
        <LogIn size={19} />
      </AuthIconButton>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthIconButton label="Войти" onClick={() => open("auth")}>
        <LogIn size={19} />
      </AuthIconButton>
    );
  }

  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-1">
      <AuthIconButton label="Личный кабинет" href="/account">
        <User size={19} />
      </AuthIconButton>
      <LogoutButton className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-line px-3 text-sm text-muted transition-colors hover:border-magenta/50 hover:text-magenta cursor-pointer" />
    </div>
  );
}

export function MobileAuthActions({ onNavigate }: { onNavigate?: () => void }) {
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
        className="mt-6 flex w-full items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-cyan/40 hover:bg-white/5 cursor-pointer"
      >
        <LogIn size={18} className="text-cyan" />
        Войти в MAZE ID
      </button>
    );
  }

  return (
    <div className="mt-6 border-t border-line pt-5">
      {displayName && (
        <p className="mb-2 px-1 text-xs text-faint">MAZE ID · {displayName}</p>
      )}
      <Link
        href="/account"
        onClick={onNavigate}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors hover:bg-white/5"
      >
        <User size={18} className="text-cyan" />
        Личный кабинет
      </Link>
      <LogoutButton
        onDone={onNavigate}
        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition-colors hover:bg-magenta/10 hover:text-magenta cursor-pointer"
      />
    </div>
  );
}
