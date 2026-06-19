"use client";

import { ClerkLoaded, ClerkLoading, useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { SignUpShineButton } from "@/components/marketing/LandingAuthButtons";
import { HeroCinematicBackdrop } from "@/components/marketing/HeroCinematicBackdrop";
import { ParcelCommandHero } from "@/components/marketing/ParcelCommandHero";
import { RevealOnMount, ParallaxScroll, HoverLift } from "@/components/marketing/landing-motion";

const TRUST_SIGNALS = [
  "Danışman bazlı takip",
  "Broker ofis görünümü",
  "İmar ve parsel farkındalığı",
  "Sesli saha notu",
] as const;

const HERO_SECONDARY_CTA_CLASS =
  "inline-flex h-12 w-full items-center justify-center rounded-xl border border-border/60 bg-parsel-panel/50 px-8 text-sm font-medium text-foreground/90 shadow-parsel-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:bg-parsel-elevated hover:text-foreground sm:w-auto";

const PANEL_BUTTON_CLASS =
  "inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-parsel-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto";

function HeroCtaActions() {
  const { isSignedIn } = useAuth();

  return (
    <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      {isSignedIn ? (
        <Link href="/dashboard" className={PANEL_BUTTON_CLASS}>
          Panele geç
        </Link>
      ) : (
        <SignUpShineButton className="mt-0 h-12 w-full px-10 shadow-parsel-md sm:w-auto">
          Ücretsiz başla
        </SignUpShineButton>
      )}
      <Link href="#workflow" className={HERO_SECONDARY_CTA_CLASS}>
        Ürünü keşfet
      </Link>
    </div>
  );
}

export function HeroShowcase() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-parsel-canvas pb-12 pt-24 sm:pb-16 sm:pt-28 lg:pb-20 lg:pt-32">
      <HeroCinematicBackdrop />

      <div className="hero-premium-stage relative z-10 mx-auto grid max-w-[1360px] items-center gap-10 px-5 sm:gap-12 sm:px-6 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-center lg:gap-8 lg:px-10 xl:max-w-[1420px] xl:gap-10 xl:px-12">
        <div className="relative flex flex-col items-start text-left lg:max-w-xl lg:pr-4 xl:max-w-2xl">
          <RevealOnMount delay={0}>
            <h1 className="font-outfit max-w-2xl text-[1.95rem] font-bold leading-[1.15] tracking-tight text-foreground sm:text-[2.5rem] lg:text-[3rem] xl:text-[3.25rem]">
              Broker ofisleri için{" "}
              <span className="landing-hero-gradient-text">portföy, müşteri ve parsel</span>{" "}
              operasyonu tek merkezde.
            </h1>
          </RevealOnMount>

          <RevealOnMount delay={90}>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base lg:text-lg">
              ParselOS, gayrimenkul danışmanlarının saha notlarını, müşteri taleplerini, portföy
              süreçlerini ve imar takibini broker disipliniyle birleştiren operasyon platformudur.
            </p>
          </RevealOnMount>

          <RevealOnMount delay={160}>
            <ul className="mt-4 flex flex-wrap gap-2 sm:mt-5" aria-label="Güven ve operasyon alanları">
              {TRUST_SIGNALS.map((signal) => (
                <li key={signal}>
                  <span className="inline-flex rounded-full border border-border/60 bg-parsel-panel/95 px-3 py-1.5 text-xs font-medium text-foreground/90 shadow-parsel-sm backdrop-blur-sm">
                    {signal}
                  </span>
                </li>
              ))}
            </ul>
          </RevealOnMount>

          <RevealOnMount delay={230}>
            <ClerkLoading>
              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                <div className="h-12 flex-1 animate-pulse rounded-xl bg-foreground/5" />
                <div className="h-12 flex-1 animate-pulse rounded-xl bg-foreground/5 sm:max-w-[200px]" />
              </div>
            </ClerkLoading>
            <ClerkLoaded>
              <HeroCtaActions />
            </ClerkLoaded>
          </RevealOnMount>

          <RevealOnMount delay={300}>
            <p className="mt-5 text-[10px] font-medium leading-relaxed text-muted-foreground sm:text-xs">
              2 ücretsiz portföy ile deneyin. Resmi kararlar için tapu, belediye ve yetkili kurum
              teyidi esastır.
            </p>
          </RevealOnMount>
        </div>

        <div className="relative mx-auto w-full max-w-[620px] lg:mx-0 lg:max-w-none">
          <ParcelCommandHero />
        </div>
      </div>

      <div className="hero-bottom-fade pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 sm:h-32" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" aria-hidden />

      <div className="landing-scroll-hint pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center" aria-hidden>
        <span className="flex flex-col items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
          Keşfet
          <span className="landing-scroll-hint-chevron block h-6 w-px bg-gradient-to-b from-muted-foreground/50 to-transparent" />
        </span>
      </div>
    </section>
  );
}
