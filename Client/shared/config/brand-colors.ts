/** MAZE — Yamaha-like charcoal teal + Pumpkin Spice */
export const BRAND = {
  green: {
    base: "#121A18",
    panel: "#0C1412",
    soft: "#0E1614",
    mid: "#182420",
  },
  warm: {
    base: "#0A100E",
    hover: "#0E1614",
    mid: "#1C2825",
    glow: "rgba(227, 121, 47, 0.14)",
    shadow: "rgba(0, 0, 0, 0.55)",
  },
  gold: {
    base: "#E3792F",
    light: "#F08A45",
    dark: "#C46520",
  },
} as const;

export const CARD_HOVER_GLOW = `radial-gradient(circle at center, ${BRAND.warm.glow} 0%, rgba(0, 0, 0, 0.55) 45%, transparent 72%)`;

export const CATEGORY_TINTS: Record<string, [string, string]> = {
  apple: ["#1C302C", "#0A1815"],
  samsung: ["#E3792F", "#152623"],
  sony: ["#F0EDE6", "#0A1815"],
  marshall: ["#9A9588", "#000000"],
  dyson: ["#1C302C", "#000000"],
  harman: ["#E3792F", "#070F0E"],
  gaming: ["#243A36", "#9A9588"],
  console: ["#152623", "#E3792F"],
  accessories: ["#0A1815", "#243A36"],
  used: ["#9A9588", "#000000"],
};

export const DEFAULT_CATEGORY_TINT: [string, string] = ["#1C302C", "#0A1815"];
