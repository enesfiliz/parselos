"use client";

import { ClerkLoaded, ClerkLoading, useAuth } from "@clerk/nextjs";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Check,
  Mic,
  Radar,
  ScanLine,
  ScanText,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import {
  SignUpShineButton,
} from "@/components/marketing/LandingAuthButtons";
import { PaymentBadges } from "@/components/marketing/PaymentBadges";
import { RevealOnScroll } from "@/components/marketing/landing-motion";
import { formatOfficePricingNote } from "@/lib/billing/plan-catalog";
import { LANDING_PRICING_PLANS } from "@/lib/billing/plan-catalog";
import { cn } from "@/lib/utils";

const MODULE_CARD =
  "parsel-surface group flex h-full flex-col rounded-2xl border border-border/60 bg-parsel-panel p-6 shadow-parsel-sm transition-all duration-200 hover:border-primary/20 hover:shadow-parsel-md sm:p-7";

const WORKFLOW_CARD =
  "parsel-surface relative flex h-full flex-col rounded-2xl border border-border/60 bg-parsel-panel p-5 shadow-parsel-sm sm:p-6";

const FEATURE_MODULES = [
  {
    id: "sesli-crm",
    title: "Sesli CRM",
    benefit: "Saha görüşmesini müşteri notuna ve göreve dönüştürür.",
    icon: Mic,
    tag: "Saha",
  },
  {
    id: "imar",
    title: "İmar Radarı",
    benefit: "Ada/parsel bazında imar ve askı değişikliklerini izler.",
    icon: Radar,
    tag: "Parsel",
  },
  {
    id: "tapu-ai",
    title: "Tapu AI",
    benefit: "Tapu suretinden ada, parsel ve malik bilgisini çıkarır.",
    icon: ScanText,
    tag: "Belge",
  },
  {
    id: "portfoy",
    title: "Portföy Yönetimi",
    benefit: "Aktif ilanları, durumları ve vitrin akışını tek yerden yönetir.",
    icon: Briefcase,
    tag: "Portföy",
  },
  {
    id: "musteri",
    title: "Müşteri Takibi",
    benefit: "Talep, bütçe ve görüşme geçmişini pipeline ile takip eder.",
    icon: Users,
    tag: "CRM",
  },
  {
    id: "fsbo",
    title: "FSBO Radar",
    benefit: "Sahibinden fırsatlarını portföy ve müşteriyle eşleştirir.",
    icon: ScanLine,
    tag: "Fırsat",
  },
] as const;

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Saha görüşmesi",
    description: "Sesli not veya saha görüşmesi kaydı oluşturulur.",
    icon: Mic,
  },
  {
    step: "02",
    title: "AI ayrıştırma",
    description: "Müşteri, bütçe ve lokasyon otomatik yapılandırılır.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "CRM kaydı",
    description: "Profil, pipeline ve portföy bağlantısı güncellenir.",
    icon: Users,
  },
  {
    step: "04",
    title: "Takip görevi",
    description: "Ajanda ve görev hatırlatması otomatik oluşur.",
    icon: CalendarDays,
  },
] as const;

const FINAL_PRIMARY_CTA =
  "inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-parsel-md transition-colors hover:bg-primary/90 sm:w-auto";

const FINAL_SECONDARY_CTA =
  "inline-flex h-12 w-full items-center justify-center rounded-xl border border-border/60 bg-parsel-panel/40 px-8 text-sm font-medium text-foreground/90 transition-all hover:border-primary/20 hover:bg-parsel-elevated hover:text-foreground sm:w-auto";

function SectionIntro({
  eyebrow,
  title,
  description,
  eyebrowClassName = "text-primary",
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description: string;
  eyebrowClassName?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className={cn("parsel-section-label", eyebrowClassName)}>{eyebrow}</p>
      <h2 className="font-outfit mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function ModulePreviewStrip({ tag }: { tag: string }) {
  return (
    <div
      className="mt-5 rounded-lg border border-border/50 bg-parsel-sunken/60 px-3 py-2.5"
      aria-hidden
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">{tag} modülü</span>
        <span className="size-1.5 rounded-full bg-primary/70" />
      </div>
      <div className="mt-2 h-1.5 w-4/5 rounded-full bg-border/80" />
      <div className="mt-1.5 h-1.5 w-3/5 rounded-full bg-primary/20" />
    </div>
  );
}

function FeatureModuleCard({
  title,
  benefit,
  icon: Icon,
  tag,
  delay = 0,
}: {
  title: string;
  benefit: string;
  icon: LucideIcon;
  tag: string;
  delay?: number;
}) {
  return (
    <RevealOnScroll delay={delay}>
      <article className={MODULE_CARD}>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-parsel-sunken/80 text-primary transition-colors group-hover:border-primary/25 group-hover:bg-accent">
            <Icon className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
          <span className="rounded-full border border-border/60 bg-parsel-elevated px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {tag}
          </span>
        </div>
        <h3 className="font-outfit mt-5 text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{benefit}</p>
        <ModulePreviewStrip tag={tag} />
      </article>
    </RevealOnScroll>
  );
}

function WorkflowStepCard({
  step,
  title,
  description,
  icon: Icon,
}: {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <article className={WORKFLOW_CARD}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-medium tracking-[0.2em] text-primary">
          {step}
        </span>
        <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border/50 bg-parsel-sunken/80 text-primary">
          <Icon className="size-4" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
      <h3 className="font-outfit mt-4 text-base font-semibold text-foreground sm:text-lg">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </article>
  );
}

export function WorkflowSection() {
  return (
    <section className="relative border-y border-border/40 bg-parsel-sunken/35 px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[1400px]">
        <RevealOnScroll>
          <SectionIntro
            align="start"
            eyebrow="Nasıl çalışır"
            eyebrowClassName="text-parsel-gold"
            title="Sahadan takip görevine dört adım"
            description="Saha görüşmesinden CRM kaydına — ParselOS operasyon akışını otomatikleştirir."
          />
        </RevealOnScroll>

        <div className="mt-10 flex flex-col gap-3 md:mt-12 md:flex-row md:items-stretch md:gap-2">
          {WORKFLOW_STEPS.map((item, index) => (
            <RevealOnScroll key={item.step} delay={index * 60} className="flex flex-1 items-stretch gap-2">
              <WorkflowStepCard {...item} />
              {index < WORKFLOW_STEPS.length - 1 ? (
                <div
                  className="hidden shrink-0 items-center self-center px-0.5 text-muted-foreground/35 md:flex"
                  aria-hidden
                >
                  <ArrowRight className="size-4" strokeWidth={1.75} />
                </div>
              ) : null}
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative scroll-mt-28 overflow-hidden px-6 py-20 sm:px-8 lg:px-12 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden>
        <div className="landing-parcel-field absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <RevealOnScroll>
          <SectionIntro
            eyebrow="Ürün modülleri"
            title="Operasyonunuzun her modülü tek panelde"
            description="Sesli CRM’den imar radarına — gayrimenkul ofisi için modüler, entegre işletim sistemi."
          />
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {FEATURE_MODULES.map((module, index) => (
            <FeatureModuleCard key={module.id} {...module} delay={index * 50} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
}: {
  plan: (typeof LANDING_PRICING_PLANS)[number];
}) {
  const isFree = plan.planType === "FREE";

  return (
    <article
      className={cn(
        "parsel-surface relative flex flex-col overflow-hidden rounded-2xl border bg-parsel-panel shadow-parsel-sm",
        plan.highlighted
          ? "border-primary/25 shadow-parsel-md"
          : "border-border/60",
      )}
    >
      {plan.badge ? (
        <span className="absolute right-5 top-5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
          {plan.badge}
        </span>
      ) : null}

      <div className="border-b border-border/60 p-6 pt-8 sm:p-8">
        <p className="parsel-section-label text-muted-foreground">{plan.marketingName}</p>
        <p className="font-outfit mt-3 text-4xl font-semibold tracking-tight text-foreground">
          {plan.priceLabel}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{plan.periodLabel}</p>

        {isFree ? (
          <p className="mt-4 inline-flex rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary">
            2 ücretsiz portföy ile başlayın
          </p>
        ) : null}

        {plan.annualNote ? (
          <p className="mt-3 text-xs font-medium text-muted-foreground">{plan.annualNote}</p>
        ) : null}
        {formatOfficePricingNote(plan) ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatOfficePricingNote(plan)}
          </p>
        ) : null}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{plan.tagline}</p>
      </div>

      <ul className="flex flex-1 flex-col gap-2.5 p-6 sm:gap-3 sm:p-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-foreground/90">
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                plan.highlighted ? "text-primary" : "text-muted-foreground",
              )}
              strokeWidth={1.5}
            />
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="p-6 pt-0 sm:p-8">
        {isFree ? (
          <SignUpShineButton className="flex h-12 w-full items-center justify-center rounded-xl border border-border/60 bg-parsel-elevated text-sm font-semibold text-foreground shadow-none hover:bg-accent">
            {plan.cta}
          </SignUpShineButton>
        ) : (
          <Link
            href="/sign-up"
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition-colors",
              plan.highlighted
                ? "bg-primary text-primary-foreground shadow-parsel-sm hover:bg-primary/90"
                : "border border-border/60 bg-parsel-elevated text-foreground hover:bg-accent",
            )}
          >
            {plan.cta}
          </Link>
        )}
      </div>
    </article>
  );
}

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative scroll-mt-28 border-t border-border/50 bg-parsel-sunken/50 px-6 py-20 sm:px-8 lg:px-12 lg:py-28"
    >
      <div className="mx-auto max-w-[1400px]">
        <RevealOnScroll>
          <SectionIntro
            eyebrow="Fiyatlandırma"
            eyebrowClassName="text-parsel-gold"
            title="Net paket, şeffaf fiyat"
            description="Ücretsiz başlangıçla deneyin. Profesyonel kullanımda danışman veya ofis paketi — fiyatlar KDV dahil."
          />
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
          {LANDING_PRICING_PLANS.map((plan, index) => (
            <RevealOnScroll key={plan.id} delay={index * 60}>
              <PricingCard plan={plan} />
            </RevealOnScroll>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-border/40 pt-8">
          <p className="text-center text-sm text-muted-foreground">
            KDV dahil fiyatlandırma · iyzico güvenli ödeme · dijital hizmet anında teslim
          </p>
          <PaymentBadges />
        </div>
      </div>
    </section>
  );
}

function FinalCtaActions() {
  const { isSignedIn } = useAuth();

  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
      {isSignedIn ? (
        <Link href="/dashboard" className={FINAL_PRIMARY_CTA}>
          Panele Git
        </Link>
      ) : (
        <SignUpShineButton className={cn(FINAL_PRIMARY_CTA, "mt-0 px-10")}>
          Ücretsiz başla
        </SignUpShineButton>
      )}
      <Link
        href={isSignedIn ? "/dashboard" : "#features"}
        className={FINAL_SECONDARY_CTA}
      >
        Kontrol panelini gör
      </Link>
    </div>
  );
}

export function FinalCtaSection() {
  return (
    <section className="px-6 pb-20 sm:px-8 lg:px-12 lg:pb-28">
      <RevealOnScroll>
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/60 bg-parsel-panel px-6 py-12 text-center shadow-parsel-lg sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute inset-0 opacity-15" aria-hidden>
            <div className="landing-parcel-field absolute inset-0" />
          </div>
          <div className="relative">
            <p className="parsel-section-label text-primary">Hemen başlayın</p>
            <h3 className="font-outfit mx-auto mt-4 max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              ParselOS ile gayrimenkul operasyonunu tek merkezden yönet.
            </h3>
            <ClerkLoading>
              <div className="mx-auto mt-8 flex h-12 w-full max-w-md animate-pulse flex-col gap-3 sm:flex-row">
                <div className="h-full flex-1 rounded-xl bg-foreground/5" />
                <div className="h-full flex-1 rounded-xl bg-foreground/5" />
              </div>
            </ClerkLoading>
            <ClerkLoaded>
              <FinalCtaActions />
            </ClerkLoaded>
            <p className="mx-auto mt-6 text-xs font-medium text-muted-foreground">
              KDV dahil · 2 ücretsiz portföy · iyzico güvenli ödeme
            </p>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
