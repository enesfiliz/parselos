"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import Link from "next/link";
import type { ReactNode } from "react";

import { getClerkAppearance } from "@/lib/clerk-appearance";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const SHINE_BUTTON_CLASS =
  "landing-btn-shine relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg px-10 text-sm font-semibold bg-parsel-gold text-background transition-colors duration-500 hover:bg-parsel-gold/90";

const OUTLINE_BUTTON_CLASS =
  "inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-10 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground";

const NAV_PANEL_LINK_CLASS =
  "inline-flex items-center justify-center rounded-lg border border-parsel-gold/30 bg-parsel-gold/10 px-5 py-2.5 text-sm font-semibold text-parsel-gold transition-colors duration-300 hover:bg-parsel-gold/15";

const NAV_SIGN_IN_CLASS =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-300 hover:text-foreground";

const NAV_SIGN_UP_CLASS =
  "inline-flex items-center justify-center rounded-lg border border-parsel-gold/30 bg-parsel-gold px-5 py-2.5 text-sm font-semibold text-background transition-colors duration-300 hover:bg-parsel-gold/90";

function AuthNavSkeleton() {
  return <div className="h-10 w-40 animate-pulse rounded-lg bg-foreground/5" />;
}

function SignedInNavActions() {
  const { resolvedTheme } = useTheme();
  const clerkAppearance = getClerkAppearance(resolvedTheme);

  return (
    <>
      <Link href="/dashboard" className={NAV_PANEL_LINK_CLASS}>
        Panele Git
      </Link>
      <UserButton
        appearance={clerkAppearance}
        userProfileProps={{ appearance: clerkAppearance }}
      />
    </>
  );
}

function LoadedNavActions() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {isSignedIn ? (
        <SignedInNavActions />
      ) : (
        <>
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <button type="button" className={NAV_SIGN_IN_CLASS}>
              Giriş Yap
            </button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <button type="button" className={NAV_SIGN_UP_CLASS}>
              Kayıt Ol
            </button>
          </SignUpButton>
        </>
      )}
    </div>
  );
}

export const HERO_GOLD_BUTTON_CLASS =
  "relative inline-flex overflow-hidden animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] bg-parsel-gold px-8 py-4 font-outfit text-sm font-semibold text-zinc-950 shadow-lg shadow-[#b38c56]/20 transition-all hover:bg-[#c5a36e] rounded-xl";

const HERO_DEMO_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-xl border border-border bg-foreground/5 px-8 py-4 font-outfit text-sm font-medium text-foreground backdrop-blur-xl transition-all hover:bg-foreground/10 hover:text-foreground";

function LoadedHeroActions({ align }: { align: "center" | "start" }) {
  const { isSignedIn } = useAuth();
  const rowClass = cn(
    "mt-10 flex flex-wrap items-center gap-4",
    align === "start" ? "justify-start" : "justify-center",
  );

  if (isSignedIn) {
    return (
      <div className={rowClass}>
        <Link href="/dashboard" className={HERO_GOLD_BUTTON_CLASS}>
          Panele Git
        </Link>
        <a href="#features" className={HERO_DEMO_BUTTON_CLASS}>
          Demoyu İncele
        </a>
      </div>
    );
  }

  return (
    <div className={rowClass}>
      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
        <button type="button" className={HERO_GOLD_BUTTON_CLASS}>
          <span className="relative z-10">Sisteme Giriş Yap</span>
          <span
            className="landing-btn-shine-sweep pointer-events-none absolute inset-0 z-20"
            aria-hidden
          />
        </button>
      </SignInButton>
      <a href="#features" className={HERO_DEMO_BUTTON_CLASS}>
        Demoyu İncele
      </a>
    </div>
  );
}

function LoadedCtaAction() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Link href="/dashboard" className={cn(SHINE_BUTTON_CLASS, "mt-12 px-12")}>
        Panele Git
      </Link>
    );
  }

  return (
    <SignUpShineButton className="mt-12 px-12">Ücretsiz Başla</SignUpShineButton>
  );
}

export function LandingNavAuth() {
  return (
    <>
      <ClerkLoading>
        <AuthNavSkeleton />
      </ClerkLoading>
      <ClerkLoaded>
        <LoadedNavActions />
      </ClerkLoaded>
    </>
  );
}

export function LandingHeroAuthActions({
  align = "center",
}: {
  align?: "center" | "start";
}) {
  return (
    <>
      <ClerkLoading>
        <div
          className={cn(
            "mt-10 flex h-[52px] w-72 animate-pulse gap-4 rounded-xl bg-transparent",
            align === "start" ? "" : "mx-auto",
          )}
        >
          <div className="h-full flex-1 rounded-xl bg-foreground/5" />
          <div className="h-full w-32 rounded-xl bg-foreground/5" />
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        <LoadedHeroActions align={align} />
      </ClerkLoaded>
    </>
  );
}

export function LandingCtaAuth() {
  return (
    <>
      <ClerkLoading>
        <div className="mx-auto mt-12 h-12 w-48 animate-pulse rounded-lg bg-foreground/5" />
      </ClerkLoading>
      <ClerkLoaded>
        <LoadedCtaAction />
      </ClerkLoaded>
    </>
  );
}

export function SignUpShineButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return null;
  }

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
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return null;
  }

  return (
    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
      <button type="button" className={cn(OUTLINE_BUTTON_CLASS, className)}>
        {children}
      </button>
    </SignInButton>
  );
}
