/** ParselOS — tek kaynak renk paleti (Tailwind, CSS vars, Clerk) */
export const parselTheme = {
  bg: "#09090b",
  card: "#18181b",
  cardElevated: "#1f1f23",
  primary: "#547236",
  primaryHover: "#6c8634",
  gold: "#c5a36e",
  goldMuted: "#c5a36e",
  border: "#27272a",
  textMain: "#fafafa",
  textMuted: "#a1a1aa",
  textSubtle: "#71717a",
} as const;

export type ParselTheme = typeof parselTheme;
