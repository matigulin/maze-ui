"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export type ModalKind = "auth" | "tradein" | null;

type ModalCtx = {
  modal: ModalKind;
  open: (m: Exclude<ModalKind, null>) => void;
  close: () => void;
};

const Ctx = createContext<ModalCtx | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalKind>(null);
  const open = useCallback((m: Exclude<ModalKind, null>) => setModal(m), []);
  const close = useCallback(() => setModal(null), []);
  return <Ctx.Provider value={{ modal, open, close }}>{children}</Ctx.Provider>;
}

export function useModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}

/** Стеклянная оболочка модалки. Portal в body — fixed не ломается от transform у родителей (motion и т.п.). */
export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "28rem",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="glass-strong iri-ring relative z-10 mx-auto w-full max-h-[min(90dvh,40rem)] overflow-y-auto rounded-3xl p-5 sm:p-8"
            style={{ maxWidth }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <h2 className="font-display text-lg font-semibold tracking-wide">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
