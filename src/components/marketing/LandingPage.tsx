import Link from "next/link";

import { HeroShowcase } from "@/components/marketing/HeroShowcase";
import {
  FeaturesSection,
  FinalCtaSection,
  PricingSection,
  TrustSection,
  WorkflowSection,
} from "@/components/marketing/LandingSections";
import { LandingNavAuth } from "@/components/marketing/LandingAuthButtons";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-parsel-canvas font-sans text-foreground">
      <header className="parsel-shell-header landing-shell-header fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-[4.25rem] max-w-[1400px] items-center justify-between gap-4 px-6 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="inline-flex shrink-0 text-foreground transition-opacity hover:opacity-90"
            aria-label="ParselOS"
          >
            <Logo className="h-10 w-auto max-w-[180px] sm:h-11" />
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            <a href="#features" className="landing-nav-link">
              Özellikler
            </a>
            <a href="#pricing" className="landing-nav-link">
              Fiyatlandırma
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border/50 bg-parsel-panel/55 px-1.5 py-1 shadow-parsel-sm backdrop-blur-sm sm:gap-2 sm:px-2">
            <ThemeToggle className="hover:bg-accent/80" />
            <span className="hidden h-5 w-px bg-border/60 sm:block" aria-hidden />
            <LandingNavAuth />
          </div>
        </div>
      </header>

      <HeroShowcase />

      <WorkflowSection />
      <FeaturesSection />
      <TrustSection />
      <PricingSection />
      <FinalCtaSection />

      <SiteFooter />
    </div>
  );
}
