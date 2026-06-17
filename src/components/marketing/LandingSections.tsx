"use client";

import { ClerkLoaded, ClerkLoading, useAuth } from "@clerk/nextjs";
import {
  ArrowRight,
  Bot,
  Briefcase,
  Building2,
  Check,
  Mic,
  Radar,
  Target,
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
  "landing-feature-card parsel-surface group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-parsel-panel p-6 shadow-parsel-sm sm:p-7";

const WORKFLOW_CARD =
  "parsel-surface relative flex h-full flex-col rounded-2xl border border-border/60 bg-parsel-panel p-5 shadow-parsel-sm transition-colors duration-300 hover:border-primary/20 sm:p-6";

const FEATURE_MODULES = [
  {
    id: "portfoy",
    title: "Portföy yönetimi",
    benefit: "Aktif ilanları, durumları ve vitrin akışını tek merkezden yönetin.",
    icon: Briefcase,
    tag: "Portföy",
    accent: "primary",
  },
  {
    id: "musteri-firsat",
    title: "Müşteri & fırsat kanbanı",
    benefit: "Talep, bütçe ve fırsat pipeline'ını kanban disipliniyle izleyin.",
    icon: Target,
    tag: "CRM",
    accent: "gold",
  },
  {
    id: "imar",
    title: "İmar Radarı",
    benefit: "Ada/parsel bazında imar ve askı değişikliklerini erken yakalayın.",
    icon: Radar,
    tag: "Parsel",
    accent: "primary",
  },
  {
    id: "sesli-crm",
    title: "Sesli CRM",
    benefit: "Saha görüşmesini müşteri notuna ve takip görevine dönüştürün.",
    icon: Mic,
    tag: "Saha",
    accent: "gold",
  },
  {
    id: "parselai",
    title: "ParselAI",
    benefit: "Ofis verinizle bağlamlı AI asistan; özet, aksiyon ve takip önerileri.",
    icon: Bot,
    tag: "AI",
    accent: "primary",
  },
  {
    id: "ofis",
    title: "Broker/ofis kontrolü",
    benefit: "Danışman, portföy ve operasyon görünürlüğünü ofis düzeyinde yönetin.",
    icon: Building2,
    tag: "Ofis",
    accent: "gold",
  },
] as const;

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Saha bilgisini yakala",
    description: "Sesli not, görüşme ve parsel/imar gözlemlerini sahada kaydedin.",
    icon: Mic,
  },
  {
    step: "02",
    title: "CRM'e dönüştür",
    description: "Müşteri profili, talep ve pipeline kaydı otomatik yapılandırılır.",
    icon: Users,
  },
  {
    step: "03",
    title: "Portföy, müşteri ve imar ile eşleştir",
    description: "Uygun ilan, fırsat ve imar sinyalleri doğru müşteriyle buluşur.",
    icon: Briefcase,
  },
  {
    step: "04",
    title: "AI ile aksiyon üret",
    description: "ParselAI özetler, hatırlatır ve bir sonraki operasyon adımını önerir.",
    icon: Bot,
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

function FeatureModuleVisual({ moduleId }: { moduleId: (typeof FEATURE_MODULES)[number]["id"] }) {
  switch (moduleId) {
    case "portfoy":
      return (
        <div className="landing-feature-visual mt-5 rounded-xl p-3" aria-hidden>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-foreground">Moda 3+1</span>
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Aktif
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-parsel-gold">₺6.200.000</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border/70">
            <div className="h-full w-[72%] rounded-full bg-primary/45" />
          </div>
        </div>
      );
    case "musteri-firsat":
      return (
        <div className="landing-feature-visual mt-5 rounded-xl p-3" aria-hidden>
          <div className="grid grid-cols-3 gap-1.5">
            {["Lead", "Gösterim", "Teklif"].map((col, index) => (
              <div key={col} className="rounded-lg border border-border/50 bg-parsel-panel/80 p-1.5">
                <p className="text-[9px] font-medium text-muted-foreground">{col}</p>
                <div
                  className={cn(
                    "mt-1.5 h-5 rounded-md border",
                    index === 2
                      ? "border-parsel-gold/30 bg-parsel-gold/10"
                      : "border-border/50 bg-parsel-sunken/70",
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      );
    case "imar":
      return (
        <div className="landing-feature-visual relative mt-5 overflow-hidden rounded-xl p-3" aria-hidden>
          <div className="hero-atlas-grid absolute inset-0 opacity-40" />
          <div className="relative flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">126 / 58</span>
            <span className="rounded-full border border-parsel-gold/30 bg-parsel-gold/10 px-2 py-0.5 text-[10px] font-semibold text-parsel-gold">
              Askı
            </span>
          </div>
          <p className="relative mt-2 text-[11px] text-foreground/85">Konut imarı · izlemede</p>
        </div>
      );
    case "sesli-crm":
      return (
        <div className="landing-feature-visual mt-5 rounded-xl p-3" aria-hidden>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
              <Mic className="size-3.5 text-primary" strokeWidth={1.75} />
            </span>
            <div className="flex-1 space-y-1">
              <div className="h-1 w-full rounded-full bg-primary/25" />
              <div className="h-1 w-4/5 rounded-full bg-primary/15" />
              <div className="h-1 w-3/5 rounded-full bg-primary/10" />
            </div>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">Saha notu → CRM kaydı</p>
        </div>
      );
    case "parselai":
      return (
        <div className="landing-feature-visual mt-5 rounded-xl p-3" aria-hidden>
          <div className="flex items-start gap-2">
            <Bot className="mt-0.5 size-3.5 shrink-0 text-parsel-gold" strokeWidth={1.75} />
            <div>
              <p className="text-[11px] font-medium text-foreground">Önerilen aksiyon</p>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                3 müşteri için portföy eşleşmesi hazır
              </p>
            </div>
          </div>
          <div className="mt-2 inline-flex rounded-full border border-parsel-gold/25 bg-parsel-gold/10 px-2 py-0.5 text-[10px] font-medium text-parsel-gold">
            AI özet
          </div>
        </div>
      );
    case "ofis":
      return (
        <div className="landing-feature-visual mt-5 rounded-xl p-3" aria-hidden>
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="text-muted-foreground">Danışman</span>
            <span className="font-medium text-foreground">12 aktif</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <div className="rounded-lg border border-border/50 bg-parsel-panel/80 px-2 py-1.5">
              <p className="text-[9px] text-muted-foreground">Portföy</p>
              <p className="text-xs font-semibold text-foreground">48</p>
            </div>
            <div className="rounded-lg border border-parsel-gold/25 bg-parsel-gold/8 px-2 py-1.5">
              <p className="text-[9px] text-muted-foreground">Pipeline</p>
              <p className="text-xs font-semibold text-parsel-gold">₺24M</p>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function FeatureModuleCard({
  id,
  title,
  benefit,
  icon: Icon,
  tag,
  accent,
  delay = 0,
}: (typeof FEATURE_MODULES)[number] & { delay?: number }) {
  const iconAccentClass =
    accent === "gold"
      ? "border-parsel-gold/20 bg-parsel-gold/8 text-parsel-gold group-hover:border-parsel-gold/30 group-hover:bg-parsel-gold/12"
      : "border-primary/20 bg-primary/8 text-primary group-hover:border-primary/30 group-hover:bg-primary/12";

  return (
    <RevealOnScroll delay={delay}>
      <article className={MODULE_CARD}>
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-[1.03]",
              iconAccentClass,
            )}
          >
            <Icon className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
          <span className="rounded-full border border-border/60 bg-parsel-elevated px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-foreground/80">
            {tag}
          </span>
        </div>
        <h3 className="font-outfit mt-5 text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{benefit}</p>
        <FeatureModuleVisual moduleId={id} />
      </article>
    </RevealOnScroll>
  );
}

function WorkflowStepCard({
  step,
  title,
  description,
  icon: Icon,
  isLast = false,
}: {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isLast?: boolean;
}) {
  return (
    <article className={cn(WORKFLOW_CARD, "md:pt-8")}>
      <div className="flex items-start gap-3 md:block">
        <span
          className={cn(
            "landing-workflow-step-index relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-parsel-panel font-mono text-xs font-semibold text-primary md:absolute md:left-1/2 md:top-0 md:-translate-x-1/2",
          )}
        >
          {step}
        </span>
        <div className="min-w-0 flex-1 md:mt-10">
          <div className="mb-3 flex items-center justify-between gap-3 md:justify-center">
            <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border/50 bg-parsel-sunken/80 text-primary md:hidden">
              <Icon className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            {!isLast ? (
              <ArrowRight
                className="size-4 text-muted-foreground/40 md:hidden"
                strokeWidth={1.75}
                aria-hidden
              />
            ) : null}
          </div>
          <h3 className="font-outfit text-base font-semibold text-foreground sm:text-lg md:text-center">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-center">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

export function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="relative scroll-mt-28 border-y border-border/40 bg-parsel-sunken/35 px-6 py-20 sm:px-8 lg:px-12 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden>
        <div className="landing-parcel-field absolute inset-0" />
      </div>

      <div className="relative mx-auto max-w-[1400px]">
        <RevealOnScroll>
          <SectionIntro
            align="start"
            eyebrow="Operasyon akışı"
            eyebrowClassName="text-parsel-gold"
            title="Sahadan AI aksiyonuna operasyon şeması"
            description="Saha bilgisini yakalayın, CRM'e dönüştürün, portföy ve imar sinyalleriyle eşleştirin, ParselAI ile aksiyon üretin."
          />
        </RevealOnScroll>

        <div className="landing-workflow-timeline mt-10 md:mt-14">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-5">
            {WORKFLOW_STEPS.map((item, index) => (
              <RevealOnScroll key={item.step} delay={index * 60}>
                <WorkflowStepCard {...item} isLast={index === WORKFLOW_STEPS.length - 1} />
              </RevealOnScroll>
            ))}
          </div>
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
            title="Parsel zekâsı olan premium CRM modülleri"
            description="Portföyden imar radarına, sesli CRM'den ParselAI'ya — gayrimenkul operasyonunuz için entegre işletim sistemi."
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
          ? "border-primary/25 shadow-parsel-md landing-pricing-featured"
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
          Panele geç
        </Link>
      ) : (
        <SignUpShineButton className={cn(FINAL_PRIMARY_CTA, "mt-0 px-10")}>
          Panele geç
        </SignUpShineButton>
      )}
      <Link href="#features" className={FINAL_SECONDARY_CTA}>
        Özellikleri keşfet
      </Link>
    </div>
  );
}

export function TrustSection() {
  return (
    <section className="relative border-y border-border/40 px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden>
        <div className="landing-parcel-field absolute inset-0" />
      </div>

      <div className="relative mx-auto max-w-[1100px]">
        <RevealOnScroll>
          <div className="landing-trust-panel overflow-hidden rounded-3xl border border-border/60 p-6 shadow-parsel-md sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-10">
              <div>
                <p className="parsel-section-label text-parsel-gold">Konumlandırma</p>
                <h2 className="font-outfit mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Sadece liste tutan CRM değil
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  ParselOS; broker disiplini, imar farkındalığı ve saha hızını aynı operasyon
                  düzeninde birleştirir. Portföy, müşteri, parsel ve saha notları tek akışta
                  ilerler.
                </p>
              </div>

              <ul className="space-y-3">
                {[
                  "Broker disiplini + imar farkındalığı + saha hızı",
                  "Portföy, müşteri ve parsel verisi aynı panelde",
                  "Sesli not ve ParselAI ile aksiyon üretimi",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-border/50 bg-parsel-panel/70 px-4 py-3 text-sm text-foreground/90"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-8 border-t border-border/50 pt-5 text-xs leading-relaxed text-muted-foreground">
              Resmi işlem öncesi imar, tapu ve mevzuat bilgileri belediye, tapu müdürlüğü ve
              yetkili kurumlardan teyit edilmelidir. ParselOS karar destek ve operasyon aracıdır;
              resmi belge niteliği taşımaz.
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
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
              Parsel, portföy ve saha operasyonunu tek merkezden yönetin.
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
