"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const SHINE_BUTTON_CLASS =
  "landing-btn-shine relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg px-10 text-sm font-semibold bg-[#C9B896] text-[#09090b] transition-colors duration-500 hover:bg-[#D4C4A8]";

const OUTLINE_BUTTON_CLASS =
  "inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] px-10 text-sm font-semibold text-zinc-300 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04]";

export function SignUpShineButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
      <button type="button" className={cn(SHINE_BUTTON_CLASS, className)}>
        <span className="relative z-10">{children}</span>
        <span
          className="landing-btn-shine-sweep pointer-events-none absolute inset-0 z-20"
          aria-hidden
        />
      </button>
    </SignUpButton>
  );
}

export function SignInOutlineButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
      <button type="button" className={cn(OUTLINE_BUTTON_CLASS, className)}>
        {children}
      </button>
    </SignInButton>
  );
}

export function SignInNavButton({ className }: { className?: string }) {
  return (
    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
      <button type="button" className={className}>
        Giriş Yap
      </button>
    </SignInButton>
  );
}
