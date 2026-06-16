import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/features/auth/LoginForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getSafeInternalRedirect } from "@/lib/auth/redirect-url";

export const metadata: Metadata = {
  title: "Giriş",
};

type LoginPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectUrl = getSafeInternalRedirect(params.redirect_url);
  const { userId } = await auth();
  if (userId) {
    redirect(redirectUrl);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
