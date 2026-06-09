"use client";

import { SignUp } from "@clerk/nextjs";

import { useParselTheme } from "@/components/providers/ThemeProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getClerkAppearance } from "@/lib/clerk-appearance";

export function SignUpPanel() {
  const { resolvedTheme } = useParselTheme();
  const appearance = getClerkAppearance(resolvedTheme);

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <SignUp
        forceRedirectUrl="/dashboard"
        signInUrl="/login"
        appearance={appearance}
      />
    </>
  );
}
