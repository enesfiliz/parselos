import Script from "next/script";

import { PARSEL_THEME_INIT_SCRIPT } from "@/lib/parsel-theme";

export function ThemeInitScript() {
  return (
    // Next App Router docs allow beforeInteractive scripts in the root layout.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      id="parsel-theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: PARSEL_THEME_INIT_SCRIPT }}
    />
  );
}
