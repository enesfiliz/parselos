"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useParselTheme } from "@/components/providers/ThemeProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getClerkAppearance } from "@/lib/clerk-appearance";

export function SignUpPanel() {
  const { resolvedTheme } = useParselTheme();
  const appearance = getClerkAppearance(resolvedTheme);
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/dashboard";
  const loginHref = redirectUrl
    ? `/login?redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/login";

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <SignUp
        forceRedirectUrl={redirectUrl}
        signInUrl={loginHref}
        appearance={appearance}
      />
      <p className="text-center text-sm text-muted-foreground">
        Zaten hesabınız var mı?{" "}
        <Link href={loginHref} className="font-medium text-primary hover:underline">
          Giriş yapın
        </Link>
      </p>
    </>
  );
}
