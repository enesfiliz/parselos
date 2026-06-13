import { PARSEL_THEME_INIT_SCRIPT } from "@/lib/parsel-theme";

export function ThemeInitScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: PARSEL_THEME_INIT_SCRIPT }}
    />
  );
}
