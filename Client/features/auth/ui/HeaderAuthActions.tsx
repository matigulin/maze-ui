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
    "relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-panel hover:text-ink cursor-pointer",
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

/** Иконка входа / ЛК в десктопном хедере. */
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
