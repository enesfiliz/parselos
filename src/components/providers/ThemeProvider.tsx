"use client";

import { ClerkProvider } from "@clerk/nextjs";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getClerkAppearance } from "@/lib/clerk-appearance";
import { parselClerkLocalization } from "@/lib/clerk-localization";
import {
  applyParselTheme,
  PARSEL_THEME_STORAGE_KEY,
  readStoredTheme,
  type ParselColorScheme,
} from "@/lib/parsel-theme";

type ParselThemeContextValue = {
  resolvedTheme: ParselColorScheme;
  setTheme: (theme: ParselColorScheme) => void;
};

const ThemeContext = createContext<ParselThemeContextValue | null>(null);

function ClerkWithTheme({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useParselTheme();
  const appearance = getClerkAppearance(resolvedTheme);

  return (
    <ClerkProvider appearance={appearance} localization={parselClerkLocalization}>
      {children}
    </ClerkProvider>
  );
}

export function useParselTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useParselTheme must be used inside ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [resolvedTheme, setResolvedTheme] = useState<ParselColorScheme>("light");

  useLayoutEffect(() => {
    const nextTheme = readStoredTheme();
    applyParselTheme(nextTheme);
    // Reconcile React/Clerk with the blocking init script (CSS already applied).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client theme sync on mount
    setResolvedTheme(nextTheme);
  }, []);

  const value = useMemo<ParselThemeContextValue>(
    () => ({
      resolvedTheme,
      setTheme(theme) {
        window.localStorage.setItem(PARSEL_THEME_STORAGE_KEY, theme);
        setResolvedTheme(theme);
        applyParselTheme(theme);
      },
    }),
    [resolvedTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ClerkWithTheme>{children}</ClerkWithTheme>
    </ThemeContext.Provider>
  );
}
