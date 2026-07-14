"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const SHOW_AFTER_PX = 200;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const readY = () =>
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const update = () => {
      setVisible(readY() > SHOW_AFTER_PX);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      aria-label="Наверх"
      style={{
        position: "fixed",
        right: 20,
        bottom: 24,
        zIndex: 9999,
      }}
      className="grid h-12 w-12 place-items-center rounded-full border border-cyan/50 bg-[#0a1020] text-cyan shadow-[0_12px_40px_-10px_rgba(53,228,240,0.7)] cursor-pointer transition-transform hover:-translate-y-0.5 md:right-8 md:bottom-8"
    >
      <ArrowUp size={20} strokeWidth={2.4} />
    </button>
  );
}
