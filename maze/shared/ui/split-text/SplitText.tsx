"use client";

import { useRef, type CSSProperties } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { FLUID_EASE, MOTION } from "@/shared/lib/motion";
import { splitText, type SplitMode } from "./lib/split-text";

export type SplitTextTrigger = "mount" | "inView";

/** Внутренний clip-контейнер: padding компенсирует overflow-hidden, чтобы не резать глифы */
const CLIP_STYLE: CSSProperties = {
  paddingTop: "0.14em",
  paddingBottom: "0.1em",
  marginTop: "-0.14em",
  marginBottom: "-0.1em",
};

type SplitTextProps = {
  text: string;
  mode?: SplitMode;
  delay?: number;
  wordGap?: string;
  className?: string;
  /** mount — сразу; inView — при скролле до блока (как hobro.digital) */
  trigger?: SplitTextTrigger;
};

/**
 * Побуквенная / пословная анимация: буквы «выезжают» из clip (hobro-style).
 */
export function SplitText({
  text,
  mode = "chars",
  delay = 0,
  wordGap = "0.28em",
  className,
  trigger = "mount",
}: SplitTextProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -6% 0px" });
  const units = splitText(text, mode);
  const stagger =
    mode === "words" ? MOTION.wordStagger : MOTION.charStagger;
  const active = trigger === "mount" ? true : inView;

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  const unitVariants: Variants = {
    hidden: { y: "108%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: MOTION.enterDuration, ease: FLUID_EASE },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      aria-label={text}
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {units.map((unit, i) => (
        <span
          key={`${unit}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden align-bottom"
          style={{
            ...CLIP_STYLE,
            ...(mode === "words" && i > 0
              ? { marginLeft: wordGap, verticalAlign: "bottom" }
              : { verticalAlign: "bottom" }),
          }}
        >
          <motion.span className="inline-block will-change-transform" variants={unitVariants}>
            {mode === "chars" && unit === " " ? "\u00A0" : unit}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
