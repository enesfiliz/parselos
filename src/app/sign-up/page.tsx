import { SignUp } from "@clerk/nextjs";

import { parselClerkAppearance } from "@/lib/clerk-appearance";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Link from "next/link";

import { Logo } from "@/components/ui/Logo";

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-[#09090b] px-4 py-16">
      <Link href="/" className="inline-flex transition-opacity hover:opacity-90">
        <Logo className="h-12 w-auto max-w-[min(100%,320px)] text-zinc-100" />
      </Link>
      <SignUp
        forceRedirectUrl="/dashboard"
        signInUrl="/login"
        appearance={parselClerkAppearance}
      />
    </div>
  );
}
