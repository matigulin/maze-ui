"use client";

import { Modal } from "@/components/modals";
import { cn } from "@/lib/utils";

export function LogoutConfirmModal({
  open,
  onClose,
  onConfirm,
  pending = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Выйти из аккаунта?" maxWidth="24rem">
      <p className="text-sm leading-relaxed text-muted">
        Вы уверены, что хотите выйти из аккаунта?
      </p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          className="btn-ghost w-full sm:w-auto"
        >
          Отмена
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className={cn(
            "inline-flex w-full items-center justify-center rounded-full border border-magenta/50 bg-magenta/15 px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-magenta/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto",
          )}
        >
          {pending ? "Выходим…" : "Выйти"}
        </button>
      </div>
    </Modal>
  );
}
