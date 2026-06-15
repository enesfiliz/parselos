import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpPanel } from "@/components/features/auth/SignUpPanel";
import { Logo } from "@/components/ui/Logo";

type SignUpPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const { userId } = await auth();
  if (userId) {
    redirect(params.redirect_url || "/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-background px-4 py-16">
      <Link href="/" className="inline-flex transition-opacity hover:opacity-90">
        <Logo className="h-12 w-auto max-w-[min(100%,320px)] text-foreground" />
      </Link>
      <SignUpPanel />
    </div>
  );
}
