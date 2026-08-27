"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";
import { cn } from "@/lib/utils";

const PANEL_BG = "#0e1126";
const SCRIM_BG = "rgba(5, 6, 14, 0.92)";

export type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  /** side — узкая панель; full — на всю ширину (навигация) */
  variant?: "side" | "full";
  panelClassName?: string;
  rootClassName?: string;
  zIndexClassName?: string;
  children: ReactNode;
};

/**
 * Мобильный drawer в portal.
 * Фон панели — inline + utility (не зависит от @layer components).
 * Opacity анимируется только у scrim, панель всегда непрозрачная.
 */
export function MobileDrawer({
  open,
  onClose,
  side = "right",
  variant = "side",
  panelClassName,
  rootClassName,
  zIndexClassName = "z-[200]",
  children,
}: MobileDrawerProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const slideFrom = side === "right" ? "100%" : "-100%";
  const panelPositionClass =
    side === "right"
      ? "right-0 border-l border-line shadow-[-24px_0_64px_-16px_rgba(0,0,0,0.75)]"
      : "left-0 border-r border-line shadow-[24px_0_64px_-16px_rgba(0,0,0,0.75)]";
  const panelWidthClass =
    variant === "full"
      ? "w-full max-w-none"
      : "w-[min(100vw-2.75rem,20rem)] max-w-md";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={cn(
            "fixed inset-0 isolate touch-none",
            zIndexClassName,
            rootClassName,
          )}
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label="Закрыть"
            className="absolute inset-0 z-0 bg-[#05060e]/92 backdrop-blur-md"
            style={{ backgroundColor: SCRIM_BG }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            aria-modal="true"
            role="dialog"
            className={cn(
              "absolute top-0 z-10 flex h-dvh min-h-dvh flex-col overflow-hidden bg-[#0e1126]",
              panelWidthClass,
              panelPositionClass,
              panelClassName,
            )}
            style={{ backgroundColor: PANEL_BG }}
            initial={{ x: slideFrom }}
            animate={{ x: 0 }}
            exit={{ x: slideFrom }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            {children}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
