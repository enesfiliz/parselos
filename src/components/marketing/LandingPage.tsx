import {
  Building2,
  Check,
  CheckCircle,
  ClipboardCheck,
  FileScan,
  PenLine,
  Radar,
  ScanText,
  Target,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { PaymentBadges } from "@/components/marketing/PaymentBadges";

import {
  LandingCtaAuth,
  LandingHeroAuthActions,
  LandingNavAuth,
  SignUpShineButton,
} from "@/components/marketing/LandingAuthButtons";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { RevealOnMount, RevealOnScroll } from "@/components/marketing/landing-motion";
import { formatOfficePricingNote } from "@/lib/billing/plan-catalog";
import { LANDING_PRICING_PLANS } from "@/lib/billing/plan-catalog";
import { cn } from "@/lib/utils";

type FeatureAnim = "tapu" | "imar" | "fsbo" | "match" | "ilan" | "ekspertiz";

const FEATURE_CARDS: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  anim: FeatureAnim;
  className?: string;
}[] = [
  {
    id: "tapu-ai",
    title: "Tapu AI",
    description:
      "Tapu sureti ve sözleşmelerden ada, parsel ve malik bilgisini çıkarır.",
    icon: ScanText,
    anim: "tapu",
    className: "md:col-span-2 lg:col-span-2",
  },
  {
    id: "fsbo",
    title: "FSBO CRM",
    description:
      "Sahibinden ilan takibi ve sahibinden satış fırsatları tek akışta.",
    icon: Building2,
    anim: "fsbo",
  },
  {
    id: "imar",
    title: "Gelişmiş İmar Radarı",
    description:
      "Bölgesel imar duyuruları ve askı uyarıları anahtar kelime ile.",
    icon: Radar,
    anim: "imar",
  },
  {
    id: "ilan",
    title: "Akıllı İlan Asistanı",
    description: "Portföy verisinden ilan metni ve başlık önerisi üretir.",
    icon: PenLine,
    anim: "ilan",
  },
  {
    id: "eslestirme",
    title: "Müşteri Eşleştirme",
    description:
      "Bütçe, lokasyon ve mülk tipine göre akıllı portföy eşleştirmesi.",
    icon: Target,
    anim: "match",
  },
  {
    id: "ekspertiz",
    title: "Otomatik Ekspertiz",
    description: "SPK uyumlu raporlar, TKGM ve uydu haritası entegrasyonu.",
    icon: ClipboardCheck,
    anim: "ekspertiz",
  },
];

const HERO_LIVE_FEED = [
  {
    id: "imar",
    icon: Radar,
    iconColor: "text-parsel-gold",
    iconBg: "bg-parsel-gold/10 border-[#b38c56]/20",
    content: (
      <>
        İmar Radarı:{" "}
        <strong className="font-medium text-foreground">
          Oluklu Köyü 126 Ada 58 Parsel
        </strong>{" "}
        güncellendi.
      </>
    ),
  },
  {
    id: "fsbo",
    icon: CheckCircle,
    iconColor: "text-[#6b8f4a]",
    iconBg: "bg-[#4d6b35]/15 border-[#4d6b35]/25",
    content: (
      <>
        Yeni FSBO Eşleşmesi:{" "}
        <strong className="font-medium text-foreground">Konut (Bütçe: 6M ₺)</strong>
      </>
    ),
  },
  {
    id: "portfolio",
    icon: TrendingUp,
    iconColor: "text-muted-foreground",
    iconBg: "bg-white/[0.04] border-border",
    content: (
      <>
        Portföy Analizi:{" "}
        <strong className="font-medium text-foreground">+14% Değer Artışı</strong>
      </>
    ),
  },
] as const;

const HERO_STATS = [
  { value: "2", label: "ücretsiz portföy" },
  { value: "₺549", label: "danışman / ay" },
  { value: "5+", label: "danışman dahil ofis" },
] as const;

function HeroProductPanel() {
  return (
    <RevealOnMount delay={200} className="w-full lg:pt-2">
      <div className="parsel-surface relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card to-parsel-sunken/80 p-6 shadow-parsel-lg sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-parsel-gold">
              Komuta merkezi
            </p>
            <p className="font-outfit text-lg font-bold text-foreground">
              Tek panelde operasyon
            </p>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">
            Canlı
          </span>
        </div>
        <ul className="space-y-3">
          {HERO_LIVE_FEED.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/60 px-4 py-3"
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                  item.iconBg,
                )}
              >
                <item.icon className={cn("size-4", item.iconColor)} strokeWidth={1.75} />
              </span>
              <p className="text-sm leading-snug text-muted-foreground">{item.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </RevealOnMount>
  );
}

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Portföyü topla",
    description: "Yetkili portföy, FSBO link import ve müşteri kayıtları tek vitrinde.",
  },
  {
    step: "02",
    title: "Sahayı izle",
    description: "İmar radarı, tapu AI ve ilan asistanı ile fırsatları kaçırmayın.",
  },
  {
    step: "03",
    title: "Raporla ve kapat",
    description: "Ekspertiz, eşleştirme ve WhatsApp raporu ile satışı hızlandırın.",
  },
] as const;

function WorkflowSection() {
  return (
    <section className="border-y border-border/40 bg-parsel-sunken/30 px-8 py-16 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-parsel-gold/90">
            Operasyon akışı
          </p>
          <h2 className="font-outfit mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Sahadan rapora üç adım
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {WORKFLOW_STEPS.map((item) => (
            <article
              key={item.step}
              className="rounded-2xl border border-border/50 bg-card/40 p-6 transition-colors hover:border-border/80"
            >
              <p className="font-mono text-xs font-medium tracking-[0.2em] text-parsel-gold">
                {item.step}
              </p>
              <h3 className="font-outfit mt-3 text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden bg-background pb-20 pt-28 lg:pb-28 lg:pt-36">
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[400px] w-[80%] max-w-4xl -translate-x-1/2 bg-gradient-to-b from-[#4d6b35]/20 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 -top-40 size-[min(560px,70vw)] rounded-full bg-[#4d6b35]/15 blur-[100px]" />
        <div className="absolute -bottom-48 -right-24 size-[min(520px,65vw)] rounded-full bg-parsel-gold/10 blur-[100px]" />
        <div className="absolute left-1/2 top-0 h-px w-[min(640px,90vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:min-h-[calc(90vh-10rem)] lg:grid-cols-2">
        <div className="flex flex-col items-start text-left">
          <RevealOnMount delay={0}>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-white/[0.03] px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground">
              ParselOS · Gayrimenkul Operasyon Platformu
            </span>
          </RevealOnMount>

          <RevealOnMount delay={80}>
            <h1 className="font-outfit mt-6 text-[2.75rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]">
              Sahada çalışan
              <br />
              <span className="text-parsel-gold">gayrimenkul</span> platformu
            </h1>
          </RevealOnMount>

          <RevealOnMount delay={160}>
            <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
              Portföy vitrini, FSBO radarı, tapu AI, ekspertiz ve ekip yönetimi -
              tek panelde. Başlangıç paketi sınırlı ve ücretsiz; profesyonel kullanımda
              danışman veya ofis lisansı.
            </p>
          </RevealOnMount>

          <RevealOnMount delay={200}>
            <dl className="mt-8 flex flex-wrap gap-6 sm:gap-10">
              {HERO_STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-outfit text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </RevealOnMount>

          <RevealOnMount delay={240}>
            <LandingHeroAuthActions align="start" />
          </RevealOnMount>
        </div>

        <HeroProductPanel />
      </div>
    </section>
  );
}

function TapuScannerVisual() {
  return (
    <div
      className="relative mt-6 h-28 overflow-hidden rounded-xl border border-border/60 bg-parsel-sunken/80"
      aria-hidden
    >
      <div className="absolute inset-0 p-4">
        <div className="space-y-2">
          {[92, 78, 85, 70, 88].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-border/80"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
      <div className="landing-tapu-scan-line absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#547236] to-transparent" />
      <div className="absolute bottom-2 right-3 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
        <FileScan className="size-3 text-[#547236]" strokeWidth={1.5} />
        Taranıyor
      </div>
    </div>
  );
}

function ImarRadarVisual() {
  return (
    <div
      className="relative mt-6 flex h-20 items-center justify-center"
      aria-hidden
    >
      <div className="relative size-16 rounded-full border border-border/60 bg-parsel-sunken/70">
        <div
          className="landing-radar-sweep absolute inset-0 rounded-full opacity-70"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(84,114,54,0.55) 42deg, transparent 72deg)",
          }}
        />
        <div className="absolute inset-[22%] rounded-full border border-[#547236]/20 bg-card/80" />
        <div className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#547236]" />
      </div>
    </div>
  );
}

function FsboCrmVisual() {
  return (
    <div className="relative mt-6 space-y-2" aria-hidden>
      <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-parsel-sunken/70 px-3 py-2">
        <span className="relative flex size-2">
          <span className="landing-fsbo-ping absolute inline-flex size-full rounded-full bg-[#547236] opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-[#547236]" />
        </span>
        <span className="text-[10px] font-medium text-muted-foreground">
          Yeni FSBO ilanı
        </span>
      </div>
      <div className="space-y-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "landing-pipeline-bar h-1.5 rounded-full bg-[#547236]/40",
              i === 2 && "landing-pipeline-bar-2",
              i === 3 && "landing-pipeline-bar-3",
            )}
            style={{ width: "100%" }}
          />
        ))}
      </div>
    </div>
  );
}

function MatchConnectionVisual() {
  return (
    <svg
      className="mt-6 h-20 w-full text-[#547236]"
      viewBox="0 0 200 64"
      aria-hidden
    >
      <circle cx="32" cy="32" r="5" fill="currentColor" opacity="0.5" />
      <circle cx="100" cy="16" r="5" fill="currentColor" opacity="0.7" />
      <circle cx="168" cy="40" r="5" fill="currentColor" opacity="0.5" />
      <line
        x1="37"
        y1="30"
        x2="95"
        y2="18"
        stroke="currentColor"
        strokeWidth="1"
        className="landing-match-line"
      />
      <line
        x1="105"
        y1="18"
        x2="163"
        y2="38"
        stroke="currentColor"
        strokeWidth="1"
        className="landing-match-line landing-match-line-2"
      />
      <line
        x1="37"
        y1="34"
        x2="163"
        y2="42"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 3"
        className="landing-match-line landing-match-line-3"
      />
    </svg>
  );
}

function IlanAssistantVisual() {
  return (
    <div className="relative mt-6 space-y-2" aria-hidden>
      {[88, 72, 95, 60].map((w, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full bg-border/80 transition-opacity duration-500"
          style={{ width: `${w}%`, opacity: 0.4 + i * 0.15 }}
        />
      ))}
      <div className="mt-2 h-1 w-8 rounded-full bg-[#B38C56]/40" />
    </div>
  );
}

function EkspertizVisual() {
  return (
    <div className="mt-6 flex gap-2" aria-hidden>
      <div className="h-14 flex-1 rounded-lg border border-border/50 bg-parsel-sunken/70 p-2">
        <div className="h-1.5 w-2/3 rounded-full bg-border" />
        <div className="mt-3 h-6 rounded bg-[#547236]/15" />
      </div>
      <div className="h-14 w-16 rounded-lg border border-[#547236]/20 bg-[#547236]/10" />
    </div>
  );
}

function FeatureCardVisual({ anim }: { anim: FeatureAnim }) {
  switch (anim) {
    case "tapu":
      return <TapuScannerVisual />;
    case "imar":
      return <ImarRadarVisual />;
    case "fsbo":
      return <FsboCrmVisual />;
    case "match":
      return <MatchConnectionVisual />;
    case "ilan":
      return <IlanAssistantVisual />;
    case "ekspertiz":
      return <EkspertizVisual />;
    default:
      return null;
  }
}

function FeatureIconWrap({
  anim,
  icon: Icon,
}: {
  anim: FeatureAnim;
  icon: LucideIcon;
}) {
  if (anim === "imar") {
    return (
      <span className="relative inline-flex size-11 items-center justify-center rounded-xl border border-border/60 bg-parsel-sunken/80 text-[#547236]">
        <span
          className="landing-radar-sweep pointer-events-none absolute inset-0 rounded-xl opacity-40"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(84,114,54,0.5) 50deg, transparent 90deg)",
          }}
          aria-hidden
        />
        <Icon className="relative size-5" strokeWidth={1.25} />
      </span>
    );
  }

  return (
    <span className="inline-flex size-11 items-center justify-center rounded-xl border border-border/60 bg-parsel-sunken/80 text-[#547236] transition-colors group-hover:border-[#547236]/30 group-hover:bg-[#547236]/10">
      <Icon className="size-5" strokeWidth={1.25} />
    </span>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  anim,
  className,
  delay = 0,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  anim: FeatureAnim;
  className?: string;
  delay?: number;
}) {
  return (
    <RevealOnScroll delay={delay}>
      <article
        className={cn(
          "group flex h-full flex-col rounded-2xl border border-border/50 bg-card/30 p-8",
          "transition-colors duration-200 hover:border-parsel-gold/25 hover:bg-card/50",
          className,
        )}
      >
        <FeatureIconWrap anim={anim} icon={icon} />
        <h3 className="font-outfit mt-5 text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm font-normal leading-relaxed text-muted-foreground">
          {description}
        </p>
        <FeatureCardVisual anim={anim} />
      </article>
    </RevealOnScroll>
  );
}

function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative scroll-mt-28 px-8 py-24 lg:px-12 lg:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <RevealOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#547236]/90">
              Özellikler
            </p>
            <h2 className="font-outfit mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Operasyonunuzun Her Adımı İçin AI
            </h2>
            <p className="mt-5 text-lg font-normal leading-relaxed text-muted-foreground">
              Tapu taramadan müşteri eşleştirmeye - tek platformda, sektör
              standartlarında akış.
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {FEATURE_CARDS.map((card, index) => (
            <FeatureCard
              key={card.id}
              title={card.title}
              description={card.description}
              icon={card.icon}
              anim={card.anim}
              className={card.className}
              delay={index * 80}
            />
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
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border bg-card",
        plan.highlighted
          ? "border-primary/30 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
          : "border-border/70",
      )}
    >
      {plan.badge ? (
        <span className="absolute right-5 top-5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {plan.badge}
        </span>
      ) : null}

      <div className="border-b border-border/60 p-8 pt-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {plan.marketingName}
        </p>
        <p className="font-outfit mt-4 text-4xl font-semibold tracking-tight text-foreground">
          {plan.priceLabel}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{plan.periodLabel}</p>
        {plan.annualNote ? (
          <p className="mt-2 text-xs font-medium text-primary">{plan.annualNote}</p>
        ) : null}
        {formatOfficePricingNote(plan) ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatOfficePricingNote(plan)}
          </p>
        ) : null}
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {plan.tagline}
        </p>
      </div>

      <ul className="flex flex-1 flex-col gap-3 p-8">
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

      <div className="p-8 pt-0">
        {plan.planType === "FREE" ? (
          <SignUpShineButton className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-muted/50 text-sm font-semibold text-foreground hover:bg-muted">
            {plan.cta}
          </SignUpShineButton>
        ) : (
          <Link
            href="/sign-up"
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition-colors",
              plan.highlighted
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border bg-muted/40 text-foreground hover:bg-muted",
            )}
          >
            {plan.cta}
          </Link>
        )}
      </div>
    </article>
  );
}

function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative scroll-mt-28 border-t border-border/50 bg-parsel-sunken/70 px-8 py-24 lg:px-12 lg:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <RevealOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B38C56]/80">
              Fiyatlandırma
            </p>
            <h2 className="font-outfit mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Net paket, şeffaf fiyat
            </h2>
            <p className="mt-5 text-lg font-medium leading-relaxed text-muted-foreground">
              Başlangıç paketi sınırlı ve ücretsiz - herkes için yeterli deneme alanı.
              Profesyonel kullanımda Danışman veya Ofis paketi. Fiyatlar KDV dahil.
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-5">
          {LANDING_PRICING_PLANS.map((plan, index) => (
            <RevealOnScroll key={plan.id} delay={index * 60}>
              <PricingCard plan={plan} />
            </RevealOnScroll>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-center text-xs text-muted-foreground">
            Ödemeler iyzico altyapısı ile güvence altındadır. Dijital hizmet anında teslim edilir.
          </p>
          <PaymentBadges />
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background font-sans text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3.5 sm:px-8 lg:px-12 lg:py-4">
          <Link
            href="/"
            className="inline-flex text-foreground transition-opacity hover:opacity-90"
            aria-label="ParselOS"
          >
            <Logo className="h-11 w-auto max-w-[190px] sm:h-12" />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Özellikler
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Fiyatlandırma
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <LandingNavAuth />
          </div>
        </div>
      </header>

      <HeroSection />

      <WorkflowSection />
      <FeaturesSection />
      <PricingSection />

      <section className="px-8 pb-20 lg:px-12 lg:pb-28">
        <RevealOnScroll>
          <div className="mx-auto max-w-[1400px] rounded-[2rem] border border-border/50 bg-white/[0.02] px-10 py-16 text-center lg:py-20">
            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Portföyünüzü bir üst seviyeye taşıyın
            </h3>
            <p className="mx-auto mt-4 max-w-md text-base font-normal text-muted-foreground">
              Dakikalar içinde hesap oluşturun; ilk ekspertiz raporunuzu üretin.
            </p>
            <LandingCtaAuth />
          </div>
        </RevealOnScroll>
      </section>

      <SiteFooter />
    </div>
  );
}
