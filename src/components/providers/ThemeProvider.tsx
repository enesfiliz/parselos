"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

import { getClerkAppearance } from "@/lib/clerk-appearance";

function ClerkWithTheme({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const appearance = getClerkAppearance(resolvedTheme);

  return (
    <ClerkProvider appearance={appearance}>{children}</ClerkProvider>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="parselos-theme"
      disableTransitionOnChange={false}
    >
      <ClerkWithTheme>{children}</ClerkWithTheme>
    </NextThemesProvider>
  );
}
