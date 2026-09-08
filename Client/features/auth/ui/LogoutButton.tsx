"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "../model/user-auth-provider";
import { LogoutConfirmModal } from "./LogoutConfirmModal";

export function LogoutButton({
  className,
  children,
  onDone,
  icon = true,
}: {
  className?: string;
  children?: ReactNode;
  onDone?: () => void;
  icon?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useUserAuth();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  function close() {
    if (pending) return;
    setOpen(false);
  }

  async function confirm() {
    if (pending) return;
    setPending(true);
    try {
      await logout();
      onDone?.();
      const onAccount =
        pathname === "/account" || pathname.startsWith("/account/");
      if (onAccount) {
        router.replace("/");
      }
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(className)}
      >
        {icon ? <LogOut size={15} /> : null}
        {children ?? <span>Выйти</span>}
      </button>
      <LogoutConfirmModal
        open={open}
        onClose={close}
        onConfirm={() => void confirm()}
        pending={pending}
      />
    </>
  );
}
