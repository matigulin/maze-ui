/** Фирменные цвета MAZE (визитка) */
export const BRAND = {
  green: {
    base: "#1a2421",
    panel: "#1e2a26",
    soft: "#243530",
    mid: "#6b9a7a",
  },
  warm: {
    base: "#2b1a1a",
    /** Красно-коричневый для hover-пятна (#2b1d1d) */
    hover: "#2b1d1d",
    mid: "#5c3838",
    glow: "rgba(92, 56, 56, 0.45)",
    shadow: "rgba(92, 56, 56, 0.32)",
  },
  gold: {
    base: "#c9aa78",
    light: "#dcc498",
    dark: "#9a8058",
  },
} as const;

/** Угловое свечение при hover — один bordo, без золота */
export const CARD_HOVER_GLOW = `radial-gradient(circle at center, ${BRAND.warm.glow} 0%, rgba(43, 29, 29, 0.28) 38%, transparent 72%)`;

/** Градиенты иконок категорий — только зелёный · бронза · bordo */
export const CATEGORY_TINTS: Record<string, [string, string]> = {
  apple: ["#c4a87a", "#8a7355"],
  samsung: ["#ad946b", "#5c3838"],
  sony: ["#8a7355", "#5c3838"],
  marshall: ["#c4a87a", "#ad946b"],
  dyson: ["#6b9a7a", "#243530"],
  harman: ["#ad946b", "#2b1a1a"],
  gaming: ["#5c3838", "#8a7355"],
  console: ["#5c3838", "#8a7355"],
  accessories: ["#8a7355", "#5c3838"],
  used: ["#6b9a7a", "#243530"],
};

export const DEFAULT_CATEGORY_TINT: [string, string] = ["#ad946b", "#5c3838"];
