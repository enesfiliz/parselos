import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-16">
      <SignUp forceRedirectUrl="/dashboard" signInUrl="/login" />
    </div>
  );
}
