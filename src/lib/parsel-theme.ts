/** ParselOS — semantic theme tokens (CSS variables in globals.css) */

export const parselBrand = {
  primary: "#547236",
  primaryHover: "#6c8634",
  gold: "#b38c56",
  goldDark: "#9a7340",
  greenLight: "#7a9f45",
  greenMid: "#4d6b35",
  greenDark: "#2b4522",
} as const;

/** @deprecated Use Tailwind tokens: bg-background, bg-parsel-panel, text-foreground */
export const parselTheme = {
  bg: "var(--parsel-canvas)",
  card: "var(--parsel-panel)",
  cardElevated: "var(--parsel-elevated)",
  primary: parselBrand.primary,
  primaryHover: parselBrand.primaryHover,
  gold: parselBrand.gold,
  goldMuted: parselBrand.gold,
  border: "var(--border)",
  textMain: "var(--foreground)",
  textMuted: "var(--muted-foreground)",
  textSubtle: "var(--muted-foreground)",
} as const;

export type ParselTheme = typeof parselTheme;
