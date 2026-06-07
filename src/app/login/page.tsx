import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/features/auth/LoginForm";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export const metadata: Metadata = {
  title: "Giriş",
};

export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

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
