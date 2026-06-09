import type { Config } from "tailwindcss";

import { parselBrand } from "./src/lib/parsel-theme";

const config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        parsel: {
          canvas: "var(--parsel-canvas)",
          panel: "var(--parsel-panel)",
          sunken: "var(--parsel-sunken)",
          elevated: "var(--parsel-elevated)",
          gold: "var(--parsel-gold)",
          "gold-muted": "var(--parsel-gold-muted)",
          admin: "var(--parsel-admin-canvas)",
          primary: parselBrand.primary,
          primaryHover: parselBrand.primaryHover,
          darkest: parselBrand.greenDark,
          mid: parselBrand.greenMid,
          light: parselBrand.greenLight,
          brown: parselBrand.gold,
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        outfit: ["var(--font-outfit)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
      },
      boxShadow: {
        "parsel-sm": "var(--parsel-shadow-sm)",
        "parsel-md": "var(--parsel-shadow-md)",
        "parsel-lg": "var(--parsel-shadow-lg)",
      },
    },
  },
} satisfies Config;

export default config;
