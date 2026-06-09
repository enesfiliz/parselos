"use client";

import { ClerkProvider } from "@clerk/nextjs";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getClerkAppearance } from "@/lib/clerk-appearance";
import { parselClerkLocalization } from "@/lib/clerk-localization";

type ParselTheme = "light" | "dark";

type ParselThemeContextValue = {
  resolvedTheme: ParselTheme;
  setTheme: (theme: ParselTheme) => void;
};

const STORAGE_KEY = "parselos-theme";
const ThemeContext = createContext<ParselThemeContextValue | null>(null);

function readStoredTheme(): ParselTheme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "dark";
}

function applyTheme(theme: ParselTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

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
  const [resolvedTheme, setResolvedTheme] = useState<ParselTheme>("dark");

  useEffect(() => {
    queueMicrotask(() => {
      const nextTheme = readStoredTheme();
      setResolvedTheme(nextTheme);
      applyTheme(nextTheme);
    });
  }, []);

  const value = useMemo<ParselThemeContextValue>(
    () => ({
      resolvedTheme,
      setTheme(theme) {
        window.localStorage.setItem(STORAGE_KEY, theme);
        setResolvedTheme(theme);
        applyTheme(theme);
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
