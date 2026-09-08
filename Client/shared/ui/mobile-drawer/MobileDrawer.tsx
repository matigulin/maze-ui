"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useBodyScrollLock } from "@/lib/body-scroll-lock";
import {
  getClientSnapshot,
  getServerSnapshot,
  subscribeNoop,
} from "@/shared/lib/client-mounted";
import { cn } from "@/lib/utils";

const PANEL_BG = "#0d1e1b";
const SCRIM_BG = "#000000";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  /** side — узкая панель; full — на всю ширину (навигация) */
  variant?: "side" | "full";
  panelClassName?: string;
  rootClassName?: string;
  zIndexClassName?: string;
  /** Подпись диалога; иначе aria-labelledby */
  "aria-label"?: string;
  "aria-labelledby"?: string;
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
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
}: MobileDrawerProps) {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );
  const panelRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const panel = panelRef.current;
    const focusFirst = () => {
      const nodes = panel?.querySelectorAll<HTMLElement>(FOCUSABLE);
      (nodes?.[0] ?? panel)?.focus();
    };
    const id = window.requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
      );
      if (nodes.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey);
      previousFocusRef.current?.focus?.();
      previousFocusRef.current = null;
    };
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
            "fixed inset-0 isolate",
            zIndexClassName,
            rootClassName,
          )}
          role="presentation"
        >
          <motion.button
            type="button"
            aria-label="Закрыть"
            className="absolute inset-0 z-0 touch-none bg-bg/92 backdrop-blur-md"
            style={{ backgroundColor: SCRIM_BG }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
            aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : "Меню")}
            aria-labelledby={ariaLabelledBy}
            className={cn(
              "absolute top-0 z-10 flex h-dvh min-h-0 max-h-dvh flex-col overflow-hidden overscroll-contain bg-panel outline-none touch-pan-y",
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
