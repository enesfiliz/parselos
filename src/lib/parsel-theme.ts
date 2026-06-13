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

export type ParselThemeTokens = typeof parselTheme;

/** User-facing light/dark appearance preference */
export type ParselColorScheme = "light" | "dark";

export const PARSEL_THEME_STORAGE_KEY = "parselos-theme";

export function readStoredTheme(): ParselColorScheme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(PARSEL_THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "light";
}

export function applyParselTheme(theme: ParselColorScheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

/** Runs synchronously before React hydration to avoid light→dark flicker. */
export const PARSEL_THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("${PARSEL_THEME_STORAGE_KEY}");var t=s==="dark"||s==="light"?s:"light";document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.style.colorScheme=t;}catch(e){}})();`;
