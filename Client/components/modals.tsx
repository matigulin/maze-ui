"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";
import { cn } from "@/lib/utils";
import {
  getClientSnapshot,
  getServerSnapshot,
  subscribeNoop,
} from "@/shared/lib/client-mounted";

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

type VisualViewportFrame = {
  top: number;
  left: number;
  height: number;
  width: number;
};

/** Видимая область над клавиатурой (iOS / Android). */
function useVisualViewportFrame(active: boolean): VisualViewportFrame | null {
  const [frame, setFrame] = useState<VisualViewportFrame | null>(null);

  useLayoutEffect(() => {
    if (!active) {
      setFrame(null);
      return;
    }

    const vv = window.visualViewport;
    if (!vv) return;

    const sync = () => {
      setFrame({
        top: vv.offsetTop,
        left: vv.offsetLeft,
        height: vv.height,
        width: vv.width,
      });
    };

    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    window.addEventListener("orientationchange", sync);

    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, [active]);

  return frame;
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
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );
  const viewportFrame = useVisualViewportFrame(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.matches("input, textarea, select")) return;
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ block: "nearest", inline: "nearest" });
      });
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [open]);

  useBodyScrollLock(open);

  if (!mounted) return null;

  const overlayStyle: CSSProperties = viewportFrame
    ? {
        top: viewportFrame.top,
        left: viewportFrame.left,
        width: viewportFrame.width,
        height: viewportFrame.height,
      }
    : { inset: 0 };

  const keyboardOpen =
    viewportFrame != null &&
    typeof window !== "undefined" &&
    viewportFrame.height < window.innerHeight * 0.75;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={cn(
            "fixed z-[100] flex items-start justify-center overflow-y-auto overscroll-contain px-4 pb-3 sm:items-center sm:overflow-visible sm:p-6",
            keyboardOpen
              ? "pt-[max(0.5rem,env(safe-area-inset-top))]"
              : "pt-[min(28vh,11rem)]",
          )}
          style={overlayStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-[#0a1815]/75 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="glass-strong iri-ring relative z-10 mx-auto w-full max-h-[calc(100%-0.5rem)] overflow-y-auto rounded-3xl p-5 sm:max-h-[min(90dvh,40rem)] sm:p-8"
            style={{ maxWidth }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <h2 className="font-display text-lg font-semibold tracking-wide text-ink">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-panel hover:text-ink cursor-pointer"
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
