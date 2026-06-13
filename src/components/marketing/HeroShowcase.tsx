"use client";

import { ClerkLoaded, ClerkLoading, useAuth } from "@clerk/nextjs";
import Link from "next/link";

import {
  SignUpShineButton,
} from "@/components/marketing/LandingAuthButtons";
import { ParcelCommandHero } from "@/components/marketing/ParcelCommandHero";
import { RevealOnMount } from "@/components/marketing/landing-motion";

const MICRO_CHIPS = ["Sesli CRM", "İmar Radarı", "Tapu AI", "Portföy takibi"] as const;

const HERO_SECONDARY_CTA_CLASS =
  "inline-flex h-12 w-full items-center justify-center rounded-xl border border-border/60 bg-parsel-panel/40 px-8 text-sm font-medium text-foreground/90 shadow-none backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-parsel-elevated hover:text-foreground sm:w-auto";

const PANEL_BUTTON_CLASS =
  "inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-parsel-md transition-colors hover:bg-primary/90 sm:w-auto";

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="landing-hero-mesh absolute inset-0" />
      <div className="landing-parcel-field landing-hero-parcel-grid absolute inset-0 opacity-[0.14]" />
      <div className="landing-hero-orbit absolute left-1/2 top-[14%] size-[min(820px,110vw)] -translate-x-1/2 rounded-full border border-primary/8" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

function HeroCtaActions() {
  const { isSignedIn } = useAuth();

  return (
    <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      {isSignedIn ? (
        <Link href="/dashboard" className={PANEL_BUTTON_CLASS}>
          Panele Git
        </Link>
      ) : (
        <SignUpShineButton className="mt-0 h-12 w-full px-10 shadow-parsel-md sm:w-auto">
          Ücretsiz başla
        </SignUpShineButton>
      )}
      <Link
        href={isSignedIn ? "/dashboard" : "#features"}
        className={HERO_SECONDARY_CTA_CLASS}
      >
        Kontrol panelini gör
      </Link>
    </div>
  );
}

export function HeroShowcase() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-parsel-canvas pb-20 pt-28 sm:pb-24 sm:pt-32 lg:pb-28 lg:pt-36">
      <HeroBackdrop />

      <div className="hero-premium-stage relative z-10 mx-auto grid max-w-[1320px] items-center gap-10 px-6 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)] lg:items-center lg:gap-8 lg:px-10 xl:max-w-[1400px] xl:gap-10 xl:px-12">
        <div className="relative flex flex-col items-start text-left lg:pr-2 xl:pr-4">
          <RevealOnMount delay={0}>
            <p className="parsel-section-label text-primary">Gayrimenkul ofisin için</p>
          </RevealOnMount>

          <RevealOnMount delay={70}>
            <h1 className="font-outfit mt-4 max-w-2xl text-[2.25rem] font-bold leading-[1.08] tracking-tight text-foreground sm:mt-5 sm:text-5xl lg:text-[3.35rem] xl:text-[3.65rem]">
              <span className="text-primary">Parsel odaklı CRM</span> işletim sistemi
            </h1>
          </RevealOnMount>

          <RevealOnMount delay={140}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
              Müşteri, portföy, saha notu ve imar/parsel verilerini tek merkezden yönetin.
            </p>
          </RevealOnMount>

          <RevealOnMount delay={200}>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Öne çıkan özellikler">
              {MICRO_CHIPS.map((chip) => (
                <li key={chip}>
                  <span className="inline-flex rounded-full border border-border/60 bg-parsel-panel/90 px-3 py-1.5 text-xs font-medium text-foreground/90 shadow-parsel-sm backdrop-blur-sm">
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
            <p className="mt-6 text-xs font-medium text-muted-foreground">
              KDV dahil · 2 ücretsiz portföy · iyzico güvenli ödeme
            </p>
          </RevealOnMount>
        </div>

        <div className="relative lg:-ml-1 xl:ml-0">
          <ParcelCommandHero />
        </div>
      </div>

      <div className="hero-bottom-fade pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 sm:h-32" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" aria-hidden />
    </section>
  );
}
