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
import type { ReactNode } from "react";
import Link from "next/link";

import {
  LandingCtaAuth,
  LandingHeroAuthActions,
  LandingNavAuth,
  SignUpShineButton,
} from "@/components/marketing/LandingAuthButtons";
import { AppIcon } from "@/components/ui/AppIcon";
import { Logo } from "@/components/ui/Logo";
import { RevealOnMount, RevealOnScroll } from "@/components/marketing/landing-motion";
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
      "Tapu ve sözleşme belgelerini tarayın; yapılandırılmış özet anında.",
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
    description: "SEO uyumlu, profesyonel ilan metinleri saniyeler içinde.",
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

const PRICING_PLANS = [
  {
    id: "starter",
    name: "Başlangıç",
    price: "Ücretsiz",
    period: "14 gün deneme",
    description: "Yeni danışmanlar ve küçük portföyler için.",
    highlighted: false,
    features: [
      "Temel müşteri takibi",
      "50 portföy kaydı limiti",
      "Standart ekspertiz şablonu",
      "E-posta desteği",
    ],
    cta: "Ücretsiz Başla",
    ctaClass:
      "bg-white/5 text-white hover:bg-white/10 border border-white/[0.08]",
  },
  {
    id: "pro",
    name: "Profesyonel",
    price: "₺1.990",
    period: "/ ay · KDV dahil",
    description: "Seviye 5 danışmanlar ve yoğun portföy için.",
    highlighted: true,
    badge: "En Çok Tercih Edilen",
    features: [
      "Sınırsız portföy ve müşteri",
      "İmar & askı uyarıları",
      "Gelişmiş raporlama ve arşiv",
      "Sesli CRM ve Tapu AI",
      "Öncelikli destek",
    ],
    cta: "Profesyonel'e Geç",
    ctaClass: "bg-zinc-100 text-black hover:bg-white",
  },
  {
    id: "office",
    name: "Ofis",
    price: "Özel teklif",
    period: "yıllık · takım",
    description: "Broker ve çok şubeli ofisler için.",
    highlighted: false,
    features: [
      "Sınırsız ekip üyesi",
      "Broker yetkileri ve roller",
      "Kurumsal SSO (yakında)",
      "Özel onboarding",
      "SLA ve telefon desteği",
    ],
    cta: "Satış ile Görüşün",
    ctaClass:
      "bg-white/5 text-white hover:bg-white/10 border border-white/[0.08]",
  },
] as const;

const HERO_LIVE_FEED = [
  {
    id: "imar",
    icon: Radar,
    iconColor: "text-[#b38c56]",
    iconBg: "bg-[#b38c56]/10 border-[#b38c56]/20",
    float: "landing-capsule-float",
    stagger: "justify-start",
    content: (
      <>
        İmar Radarı:{" "}
        <strong className="font-medium text-white">
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
    float: "landing-capsule-float-2",
    stagger: "justify-center",
    content: (
      <>
        Yeni FSBO Eşleşmesi:{" "}
        <strong className="font-medium text-white">Konut (Bütçe: 6M ₺)</strong>
      </>
    ),
  },
  {
    id: "portfolio",
    icon: TrendingUp,
    iconColor: "text-zinc-400",
    iconBg: "bg-white/[0.04] border-white/10",
    float: "landing-capsule-float-3",
    stagger: "justify-end",
    content: (
      <>
        Portföy Analizi:{" "}
        <strong className="font-medium text-white">+14% Değer Artışı</strong>
      </>
    ),
  },
] as const;

function HeroLiveFeedPill({
  icon: Icon,
  iconColor,
  iconBg,
  float,
  children,
}: {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  float: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        float,
        "flex w-full max-w-[min(100%,22rem)] items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-3.5 text-sm shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full border",
          iconBg,
        )}
      >
        <Icon className={cn("size-[18px]", iconColor)} strokeWidth={1.5} />
      </span>
      <p className="min-w-0 flex-1 text-left leading-snug text-zinc-400">
        {children}
      </p>
    </div>
  );
}

function HeroLiveFeed() {
  return (
    <RevealOnMount delay={280} className="w-full lg:pt-4">
      <div className="relative min-h-[320px] w-full py-6 sm:min-h-[360px]">
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl bg-[#4d6b35]/5 blur-[100px]"
          aria-hidden
        />
        <ul className="relative flex flex-col gap-4 sm:gap-5">
          {HERO_LIVE_FEED.map((item) => (
            <li key={item.id} className={cn("flex w-full", item.stagger)}>
              <HeroLiveFeedPill
                icon={item.icon}
                iconColor={item.iconColor}
                iconBg={item.iconBg}
                float={item.float}
              >
                {item.content}
              </HeroLiveFeedPill>
            </li>
          ))}
        </ul>
      </div>
    </RevealOnMount>
  );
}

function HeroSection() {
  return (
    <section className="relative isolate min-h-[90vh] overflow-hidden bg-[#09090b] pb-24 pt-28 lg:pb-32 lg:pt-36">
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[400px] w-[80%] max-w-4xl -translate-x-1/2 bg-gradient-to-b from-[#4d6b35]/20 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="landing-aurora-blob absolute -left-32 -top-40 size-[min(560px,70vw)] rounded-full bg-[#4d6b35]/20 blur-[120px] sm:blur-[160px]" />
        <div className="landing-aurora-blob-gold absolute -bottom-48 -right-24 size-[min(520px,65vw)] rounded-full bg-[#b38c56]/15 blur-[120px] sm:blur-[160px]" />
        <div className="absolute left-1/2 top-0 h-px w-[min(640px,90vw)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 lg:min-h-[calc(90vh-10rem)] lg:grid-cols-2">
        <div className="flex flex-col items-start text-left">
          <RevealOnMount delay={0}>
            <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs font-medium tracking-wide text-zinc-400">
              ✨ ParselOS v1.0 Yayında
            </span>
          </RevealOnMount>

          <RevealOnMount delay={80}>
            <h1 className="font-outfit mt-6 text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500 sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]">
              Gayrimenkulde
              <br />
              Yapay Zeka Devrimi
            </h1>
          </RevealOnMount>

          <RevealOnMount delay={160}>
            <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-zinc-400 sm:text-lg">
              SPK uyumlu ekspertiz, müşteri radarı ve TKGM entegrasyonu — tek
              panelde, profesyonel operasyon akışı.
            </p>
          </RevealOnMount>

          <RevealOnMount delay={220}>
            <LandingHeroAuthActions align="start" />
          </RevealOnMount>
        </div>

        <HeroLiveFeed />
      </div>
    </section>
  );
}

function TapuScannerVisual() {
  return (
    <div
      className="relative mt-6 h-28 overflow-hidden rounded-xl border border-white/[0.06] bg-zinc-950/60"
      aria-hidden
    >
      <div className="absolute inset-0 p-4">
        <div className="space-y-2">
          {[92, 78, 85, 70, 88].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-zinc-800/80"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
      <div className="landing-tapu-scan-line absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#547236] to-transparent" />
      <div className="absolute bottom-2 right-3 flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
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
      <div className="relative size-16 rounded-full border border-white/[0.06] bg-zinc-950/50">
        <div
          className="landing-radar-sweep absolute inset-0 rounded-full opacity-70"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(84,114,54,0.55) 42deg, transparent 72deg)",
          }}
        />
        <div className="absolute inset-[22%] rounded-full border border-[#547236]/20 bg-zinc-900/80" />
        <div className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#547236]" />
      </div>
    </div>
  );
}

function FsboCrmVisual() {
  return (
    <div className="relative mt-6 space-y-2" aria-hidden>
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-zinc-950/50 px-3 py-2">
        <span className="relative flex size-2">
          <span className="landing-fsbo-ping absolute inline-flex size-full rounded-full bg-[#547236] opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-[#547236]" />
        </span>
        <span className="text-[10px] font-medium text-zinc-500">
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
          className="h-1.5 rounded-full bg-zinc-800/80 transition-opacity duration-500"
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
      <div className="h-14 flex-1 rounded-lg border border-white/[0.05] bg-zinc-950/50 p-2">
        <div className="h-1.5 w-2/3 rounded-full bg-zinc-800" />
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
      <span className="relative inline-flex size-11 items-center justify-center rounded-xl border border-white/[0.08] bg-zinc-950/60 text-[#547236]">
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
    <span className="inline-flex size-11 items-center justify-center rounded-xl border border-white/[0.08] bg-zinc-950/60 text-[#547236] transition-colors group-hover:border-[#547236]/30 group-hover:bg-[#547236]/10">
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
          "group landing-card-anim-fast flex h-full flex-col rounded-3xl border border-white/[0.05] bg-white/[0.02] p-8",
          "transition-all duration-500 hover:border-white/15 hover:shadow-[0_0_40px_rgba(84,114,54,0.08)]",
          className,
        )}
      >
        <FeatureIconWrap anim={anim} icon={icon} />
        <h3 className="font-outfit mt-5 text-lg font-semibold tracking-tight text-zinc-100">
          {title}
        </h3>
        <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-zinc-400">
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
            <h2 className="font-outfit mt-5 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
              Operasyonunuzun Her Adımı İçin AI
            </h2>
            <p className="mt-5 text-lg font-light leading-relaxed text-zinc-400">
              Tapu taramadan müşteri eşleştirmeye — tek platformda, sektör
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
  plan: (typeof PRICING_PLANS)[number];
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[2rem] border border-white/[0.05]",
        "bg-gradient-to-b from-white/[0.03] to-[#09090b]",
        plan.highlighted && "ring-1 ring-[#547236]",
      )}
    >
      {"badge" in plan && plan.badge ? (
        <span className="absolute right-6 top-6 rounded-full border border-[#547236]/40 bg-[#547236]/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#547236]">
          {plan.badge}
        </span>
      ) : null}

      <div className="border-b border-white/[0.05] p-8 pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          {plan.name}
        </p>
        <p className="font-outfit mt-4 text-4xl font-semibold tracking-tight text-zinc-100">
          {plan.price}
        </p>
        <p className="mt-1 text-sm font-light text-zinc-500">{plan.period}</p>
        <p className="mt-4 text-sm font-light leading-relaxed text-zinc-400">
          {plan.description}
        </p>
      </div>

      <ul className="flex flex-1 flex-col gap-3 p-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                plan.highlighted ? "text-[#547236]" : "text-zinc-500",
              )}
              strokeWidth={1.5}
            />
            <span className="font-light leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <div className="p-8 pt-0">
        {plan.id === "starter" ? (
          <SignUpShineButton
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold",
              plan.ctaClass,
            )}
          >
            {plan.cta}
          </SignUpShineButton>
        ) : plan.id === "pro" ? (
          <Link
            href="/sign-up"
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition-colors",
              plan.ctaClass,
            )}
          >
            {plan.cta}
          </Link>
        ) : (
          <a
            href="mailto:info@parselos.com?subject=Ofis%20Paketi"
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold transition-colors",
              plan.ctaClass,
            )}
          >
            {plan.cta}
          </a>
        )}
      </div>
    </article>
  );
}

function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative scroll-mt-28 border-t border-white/[0.05] bg-zinc-950/50 px-8 py-24 lg:px-12 lg:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <RevealOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#B38C56]/80">
              Fiyatlandırma
            </p>
            <h2 className="font-outfit mt-5 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl lg:text-5xl">
              Her Ölçekteki Gayrimenkul Profesyoneli İçin
            </h2>
            <p className="mt-5 text-lg font-light leading-relaxed text-zinc-400">
              Başlangıç paketiyle deneyin; portföyünüz büyüdükçe Profesyonel veya
              Ofis planına geçin.
            </p>
          </div>
        </RevealOnScroll>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-5">
          {PRICING_PLANS.map((plan, index) => (
            <RevealOnScroll key={plan.id} delay={index * 100}>
              <PricingCard plan={plan} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#09090b] font-sans text-zinc-100">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.05] bg-[#09090b]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-4 lg:px-12 lg:py-5">
          <Link
            href="/"
            className="inline-flex text-zinc-100 transition-opacity hover:opacity-90"
            aria-label="ParselOS"
          >
            <Logo className="h-14 w-auto max-w-[min(100%,360px)] text-zinc-100" />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Özellikler
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Fiyatlandırma
            </a>
          </nav>
          <LandingNavAuth />
        </div>
      </header>

      <HeroSection />

      <FeaturesSection />
      <PricingSection />

      <section className="px-8 pb-20 lg:px-12 lg:pb-28">
        <RevealOnScroll>
          <div className="mx-auto max-w-[1400px] rounded-[2rem] border border-white/[0.05] bg-white/[0.02] px-10 py-16 text-center lg:py-20">
            <h3 className="font-outfit text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
              Portföyünüzü bir üst seviyeye taşıyın
            </h3>
            <p className="mx-auto mt-4 max-w-md text-base font-light text-zinc-400">
              Dakikalar içinde hesap oluşturun; ilk ekspertiz raporunuzu üretin.
            </p>
            <LandingCtaAuth />
          </div>
        </RevealOnScroll>
      </section>

      <footer className="border-t border-white/[0.05] px-8 py-12 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="flex items-center gap-2.5 text-sm text-zinc-500">
            <AppIcon className="h-5 w-5" />
            ParselOS © {new Date().getFullYear()}
          </span>
          <span className="text-sm font-light text-zinc-500">
            Yapay zeka destekli gayrimenkul operasyonları
          </span>
        </div>
      </footer>
    </div>
  );
}
