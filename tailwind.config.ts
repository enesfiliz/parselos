import type { Config } from "tailwindcss";

import { parselTheme } from "./src/lib/parsel-theme";

const config = {
  theme: {
    extend: {
      colors: {
        parsel: {
          bg: parselTheme.bg,
          card: parselTheme.card,
          elevated: parselTheme.cardElevated,
          primary: parselTheme.primary,
          primaryHover: parselTheme.primaryHover,
          gold: parselTheme.gold,
          border: parselTheme.border,
          textMain: parselTheme.textMain,
          textMuted: parselTheme.textMuted,
          subtle: parselTheme.textSubtle,
          darkest: "#2B4522",
          mid: "#4D6B35",
          light: "#7A9F45",
          brown: "#B38C56",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        outfit: ["var(--font-outfit)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
    },
  },
} satisfies Config;

export default config;
