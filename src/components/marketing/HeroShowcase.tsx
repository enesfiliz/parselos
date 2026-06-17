"use client";

import { ClerkLoaded, ClerkLoading, useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { SignUpShineButton } from "@/components/marketing/LandingAuthButtons";
import { HeroCinematicBackdrop } from "@/components/marketing/HeroCinematicBackdrop";
import { ParcelCommandHero } from "@/components/marketing/ParcelCommandHero";
import { RevealOnMount } from "@/components/marketing/landing-motion";

const MICRO_CHIPS = [
  "Parsel grid",
  "İmar radarı",
  "Sesli saha notu",
  "ParselAI",
] as const;

const HERO_SECONDARY_CTA_CLASS =
  "inline-flex h-12 w-full items-center justify-center rounded-xl border border-border/60 bg-parsel-panel/50 px-8 text-sm font-medium text-foreground/90 shadow-parsel-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:bg-parsel-elevated hover:text-foreground sm:w-auto";

const PANEL_BUTTON_CLASS =
  "inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-parsel-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 sm:w-auto";

function HeroBackdrop() {
  return <HeroCinematicBackdrop />;
}

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
          Panele geç
        </SignUpShineButton>
      )}
      <Link href="#features" className={HERO_SECONDARY_CTA_CLASS}>
        Özellikleri keşfet
      </Link>
    </div>
  );
}

export function HeroShowcase() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-parsel-canvas pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36">
      <HeroBackdrop />

      <div className="hero-premium-stage relative z-10 mx-auto grid max-w-[1360px] items-center gap-12 px-6 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-center lg:gap-10 lg:px-10 xl:max-w-[1420px] xl:gap-12 xl:px-12">
        <div className="relative flex flex-col items-start text-left lg:max-w-xl lg:pr-4 xl:max-w-2xl">
          <RevealOnMount delay={0}>
            <p className="parsel-section-label inline-flex items-center gap-2 text-primary">
              <span className="size-1.5 rounded-full bg-parsel-gold" aria-hidden />
              Broker & kadastro operasyon sistemi
            </p>
          </RevealOnMount>

          <RevealOnMount delay={70}>
            <h1 className="font-outfit mt-5 max-w-2xl text-[2.2rem] font-bold leading-[1.08] tracking-tight text-foreground sm:text-[2.75rem] lg:text-[3.2rem] xl:text-[3.5rem]">
              Emlak operasyonunu{" "}
              <span className="landing-hero-gradient-text">portföyden parsele</span> tek sistemde
              yönet.
            </h1>
          </RevealOnMount>

          <RevealOnMount delay={140}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
              ParselOS; müşteri takibi, portföy yönetimi, imar radarı, sesli saha notları ve
              ParselAI asistanını broker/ofis düzeninde birleştirir.
            </p>
          </RevealOnMount>

          <RevealOnMount delay={200}>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Öne çıkan yetenekler">
              {MICRO_CHIPS.map((chip) => (
                <li key={chip}>
                  <span className="inline-flex rounded-full border border-border/60 bg-parsel-panel/95 px-3 py-1.5 text-xs font-medium text-foreground/90 shadow-parsel-sm backdrop-blur-sm">
                    {chip}
                  </span>
                </li>
              ))}
            </ul>
          </RevealOnMount>

          <RevealOnMount delay={260}>
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

          <RevealOnMount delay={320}>
            <p className="mt-6 text-xs font-medium leading-relaxed text-muted-foreground">
              KDV dahil · 2 ücretsiz portföy
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
