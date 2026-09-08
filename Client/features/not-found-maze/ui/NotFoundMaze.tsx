"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Compass } from "lucide-react";
import { FLUID_EASE } from "@/shared/lib/motion";
import { ImageSpotlight } from "@/shared/ui/image-spotlight";
import { SplitText } from "@/shared/ui/split-text";
import { NOT_FOUND_ART, NOT_FOUND_COPY } from "../lib/constants";
import { NotFoundVisitCard } from "./NotFoundVisitCard";

function restFromLetter(
  root: HTMLElement,
  letter: HTMLElement,
): { x: number; y: number } {
  const rb = root.getBoundingClientRect();
  const lb = letter.getBoundingClientRect();
  const x = ((lb.left + lb.width / 2 - rb.left) / rb.width) * 100;
  const y = ((lb.top + lb.height / 2 - rb.top) / rb.height) * 100;
  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
  };
}

export function NotFoundMaze() {
  const sectionRef = useRef<HTMLElement>(null);
  const veRef = useRef<HTMLSpanElement>(null);
  const [rest, setRest] = useState({ x: 54, y: 58 });

  useLayoutEffect(() => {
    const root = sectionRef.current;
    const letter = veRef.current;
    if (!root || !letter) return;

    const measure = () => setRest(restFromLetter(root, letter));
    measure();
    const id = window.setTimeout(measure, 900);
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const titleClass =
    "text-[clamp(1.6rem,4.2vw,2.75rem)] tracking-tight";

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[min(92vh,920px)] w-full overflow-hidden"
    >
      <div className="absolute inset-0">
        <ImageSpotlight
          image={NOT_FOUND_ART}
          mode="onImage"
          restX={rest.x}
          restY={rest.y}
          fit="cover"
          focusY={42}
          veilColor="#000000"
          size={560}
          visibility={4}
          rounded={0}
          pointerScope="window"
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <div className="absolute bottom-5 right-5 max-sm:left-1/2 max-sm:right-auto max-sm:-translate-x-1/2">
            <NotFoundVisitCard />
          </div>
        </ImageSpotlight>
      </div>

      <div className="container-x relative z-10 flex min-h-[min(92vh,920px)] flex-col items-center justify-center py-20 text-center pointer-events-none md:py-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: FLUID_EASE }}
          className="eyebrow"
        >
          Путь не найден
        </motion.p>

        <p
          className="font-display text-[clamp(5rem,18vw,11rem)] font-bold leading-none text-iri"
          aria-hidden
        >
          {NOT_FOUND_COPY.code}
        </p>

        <h1
          className="mt-2 max-w-xl font-display font-bold leading-[1.12]"
          aria-label={NOT_FOUND_COPY.title}
        >
          <span className={`block ${titleClass}`}>
            <SplitText
              text={NOT_FOUND_COPY.titleBefore}
              mode="words"
              delay={0.12}
            />{" "}
            <span ref={veRef} className="inline-block">
              <SplitText text={NOT_FOUND_COPY.titleVe} mode="chars" delay={0.28} />
            </span>{" "}
            <SplitText
              text={NOT_FOUND_COPY.titleAfter}
              mode="words"
              delay={0.34}
            />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: FLUID_EASE, delay: 0.45 }}
          className="mt-4 max-w-md text-base leading-relaxed text-muted sm:text-lg"
        >
          {NOT_FOUND_COPY.body}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: FLUID_EASE, delay: 0.65 }}
          className="mt-10 flex flex-wrap justify-center gap-3 pointer-events-auto"
        >
          <Link href="/" className="btn-primary group">
            {NOT_FOUND_COPY.home}
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link href="/catalog" className="btn-ghost group">
            <Compass size={17} className="text-accent" />
            {NOT_FOUND_COPY.catalog}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
