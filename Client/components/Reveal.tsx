"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  once?: boolean;
};

/** Плавное появление при попадании в зону видимости (с учётом reduced-motion). */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  once = true,
  ...props
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce)
    return (
      <div className={props.className as string} style={props.style as React.CSSProperties}>
        {children as React.ReactNode}
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
