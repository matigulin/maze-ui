"use client";

import Link from "next/link";
import { LogIn, User } from "lucide-react";
import { useModal } from "@/components/modals";
import { cn } from "@/lib/utils";
import { useUserAuth } from "../model/user-auth-provider";

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
    <AuthIconButton label="Личный кабинет" href="/account">
      <User size={19} />
    </AuthIconButton>
  );
}

export function MobileAuthActions({ onNavigate }: { onNavigate?: () => void }) {
  const { ready, isAuthenticated, displayName } = useUserAuth();
  const { open } = useModal();

  if (!ready) return null;

  if (!isAuthenticated) {
    return (
      <div className="mt-4 border-t border-line pt-5">
        <button
          type="button"
          onClick={() => {
            open("auth");
            onNavigate?.();
          }}
          className="flex w-full items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-cyan/40 hover:bg-white/5 cursor-pointer"
        >
          <LogIn size={18} className="text-cyan" />
          Войти в MAZE ID
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-line pt-5">
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
    </div>
  );
}
