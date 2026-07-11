"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuth } from "@/components/staff/StaffAuthProvider";
import { AdminShell } from "@/components/admin/AdminShell";

/** Any authenticated staff can use admin for now; roles later. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { ready, isStaff } = useStaffAuth();

  useEffect(() => {
    if (!ready) return;
    if (!isStaff) router.replace("/staff/login");
  }, [ready, isStaff, router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Проверка сессии…
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Перенаправление на вход…
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
