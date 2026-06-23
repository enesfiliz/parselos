"use client";

import { ClerkLoaded, ClerkLoading, useAuth } from "@clerk/nextjs";
import Link from "next/link";

import { SignUpShineButton } from "@/components/marketing/LandingAuthButtons";
import { HeroCinematicBackdrop } from "@/components/marketing/HeroCinematicBackdrop";
import { ParcelCommandHero } from "@/components/marketing/ParcelCommandHero";
import { RevealOnMount } from "@/components/marketing/landing-motion";

const TRUST_SIGNALS = [
  "Broker operasyon ritmi",
  "Portföy ve müşteri akışı",
  "Parsel grafiği ve imar sinyali",
  "Sesli saha takibi",
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

      <div className="hero-premium-stage relative z-10 mx-auto grid max-w-[1400px] items-center gap-10 px-5 sm:gap-12 sm:px-6 lg:min-h-[calc(100svh-7.25rem)] lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center lg:gap-8 lg:px-10 xl:gap-12 xl:px-12">
        <div className="relative flex flex-col items-start text-left lg:max-w-[34rem] lg:pr-2 xl:max-w-[40rem]">
          <RevealOnMount delay={0}>
            <p className="mb-4 inline-flex rounded-full border border-primary/18 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary shadow-parsel-sm backdrop-blur-sm">
              ParselOS gayrimenkul CRM platformu
            </p>
            <h1 className="font-outfit max-w-3xl text-[2.35rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-[3.25rem] lg:text-[3.65rem] xl:text-[4.2rem]">
              Gayrimenkul operasyonunu{" "}
              <span className="landing-hero-gradient-text">yerçekimsiz bir komuta alanına</span>{" "}
              taşıyın.
            </h1>
          </RevealOnMount>

          <RevealOnMount delay={90}>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
              Portföyler, müşteri talepleri, saha notları ve parsel sinyalleri tek ekranda
              birleşir. Broker ofisleri için sakin, hızlı ve güven veren bir operasyon akışı.
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

    </section>
  );
}
