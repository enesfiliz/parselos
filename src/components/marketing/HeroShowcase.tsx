import {
  CheckCircle,
  MapPin,
  Radar,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import { LandingHeroAuthActions } from "@/components/marketing/LandingAuthButtons";
import { RevealOnMount } from "@/components/marketing/landing-motion";
import { cn } from "@/lib/utils";

const HERO_STATS = [
  { value: "2", label: "ücretsiz portföy", accent: false },
  { value: "₺549", label: "danışman / ay", accent: true },
  { value: "5+", label: "danışman dahil ofis", accent: false },
] as const;

const FLOATING_ALERTS = [
  {
    id: "imar",
    icon: Radar,
    tone: "border-[#b38c56]/35 bg-[#b38c56]/10 text-[#d4a574]",
    title: "İmar Radarı",
    body: "126 Ada 58 Parsel güncellendi",
    delay: "0s",
  },
  {
    id: "fsbo",
    icon: CheckCircle,
    tone: "border-[#6b8f4a]/35 bg-[#4d6b35]/15 text-[#8fb86a]",
    title: "FSBO Eşleşmesi",
    body: "Konut · Bütçe 6M ₺",
    delay: "-1.2s",
  },
  {
    id: "value",
    icon: TrendingUp,
    tone: "border-border/50 bg-white/[0.04] text-muted-foreground",
    title: "Portföy Analizi",
    body: "+14% değer artışı",
    delay: "-2.4s",
  },
] as const;

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="landing-hero-mesh absolute inset-0" />
      <div className="landing-parcel-field landing-hero-parcel-grid absolute inset-0 opacity-[0.22]" />
      <div className="landing-hero-orbit absolute left-1/2 top-[18%] size-[min(900px,120vw)] -translate-x-1/2 rounded-full border border-[#547236]/10" />
      <div className="landing-hero-orbit landing-hero-orbit-reverse absolute left-1/2 top-[22%] size-[min(680px,95vw)] -translate-x-1/2 rounded-full border border-parsel-gold/10" />
      <div className="landing-aurora-blob absolute -left-32 top-0 size-[min(520px,70vw)] rounded-full bg-[#4d6b35]/25 blur-[110px]" />
      <div className="landing-aurora-blob-gold absolute -right-24 bottom-0 size-[min(480px,65vw)] rounded-full bg-parsel-gold/15 blur-[100px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="landing-hero-scan absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#547236]/10 to-transparent" />
    </div>
  );
}

function HeroMiniMap() {
  return (
    <div className="relative h-36 overflow-hidden rounded-xl border border-border/50 bg-[#0a0a0a]/80">
      <div className="landing-parcel-field absolute inset-0 opacity-40" />
      <div className="landing-radar-sweep absolute inset-0 opacity-30" style={{
        background:
          "conic-gradient(from 0deg, transparent 0deg, rgba(84,114,54,0.55) 42deg, transparent 88deg)",
      }} />
      {[12, 28, 45, 62, 78].map((left, i) => (
        <span
          key={left}
          className="landing-hero-parcel-dot absolute size-2 rounded-sm bg-[#547236]/70"
          style={{ left: `${left}%`, top: `${22 + (i % 3) * 22}%`, animationDelay: `${i * 0.35}s` }}
        />
      ))}
      <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[10px] font-medium text-[#8fb86a]">
        <MapPin className="size-3" strokeWidth={2} />
        Canlı parsel izleme
      </div>
    </div>
  );
}

function HeroStagePanel() {
  return (
    <RevealOnMount delay={180} className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="landing-hero-stage relative">
        <div className="landing-hero-glow absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-[#547236]/20 via-transparent to-parsel-gold/15 blur-2xl" />

        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-b from-[#141414] to-[#0a0a0a] p-1 shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
          <div className="rounded-[1.55rem] border border-border/40 bg-[#111]/90 p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-parsel-gold">
                  <Sparkles className="size-3.5" strokeWidth={2} />
                  Komuta Merkezi
                </p>
                <p className="font-outfit mt-1 text-xl font-bold text-foreground">
                  Tek panelde operasyon
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-emerald-300">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative size-2 rounded-full bg-emerald-400" />
                </span>
                Canlı
              </span>
            </div>

            <HeroMiniMap />

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "Portföy", value: "24" },
                { label: "FSBO", value: "8" },
                { label: "Ekspertiz", value: "12" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border/40 bg-background/50 px-3 py-2.5 text-center"
                >
                  <p className="font-outfit text-lg font-bold text-foreground">{item.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {FLOATING_ALERTS.map((alert, index) => (
          <div
            key={alert.id}
            className={cn(
              "landing-hero-float-card absolute z-20 flex max-w-[220px] items-start gap-2.5 rounded-xl border px-3.5 py-3 backdrop-blur-md shadow-lg",
              alert.tone,
              index === 0 && "-left-2 top-8 sm:-left-8",
              index === 1 && "-right-1 top-1/2 -translate-y-1/2 sm:-right-6",
              index === 2 && "bottom-6 left-6 sm:left-10",
            )}
            style={{ animationDelay: alert.delay }}
          >
            <alert.icon className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                {alert.title}
              </p>
              <p className="mt-0.5 text-xs font-medium text-foreground">{alert.body}</p>
            </div>
          </div>
        ))}
      </div>
    </RevealOnMount>
  );
}

export function HeroShowcase() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-background pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36">
      <HeroBackdrop />

      <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-14 px-6 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-2 lg:gap-10 lg:px-12">
        <div className="flex flex-col items-start text-left">
          <RevealOnMount delay={0}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#547236]/30 bg-[#547236]/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#a8c48a]">
              <Zap className="size-3.5 text-parsel-gold" strokeWidth={2} />
              ParselOS · Gayrimenkul Operasyon Platformu
            </span>
          </RevealOnMount>

          <RevealOnMount delay={70}>
            <h1 className="font-outfit mt-7 text-[2.65rem] font-bold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem]">
              Sahada çalışan
              <br />
              <span className="landing-hero-gradient-text">gayrimenkul</span>
              <br />
              komuta platformu
            </h1>
          </RevealOnMount>

          <RevealOnMount delay={140}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Portföy vitrini, FSBO radarı, tapu AI, ekspertiz ve ekip yönetimi —
              tek panelde birleşir. Ücretsiz başlangıç; profesyonel kullanımda
              danışman veya ofis lisansı.
            </p>
          </RevealOnMount>

          <RevealOnMount delay={200}>
            <dl className="mt-8 grid w-full max-w-lg grid-cols-3 gap-3">
              {HERO_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className={cn(
                    "rounded-xl border px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4",
                    stat.accent
                      ? "border-parsel-gold/30 bg-parsel-gold/10"
                      : "border-border/50 bg-white/[0.03]",
                  )}
                >
                  <dt className="font-outfit text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-[10px] font-medium uppercase leading-tight tracking-wider text-muted-foreground sm:text-[11px]">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </RevealOnMount>

          <RevealOnMount delay={260}>
            <LandingHeroAuthActions align="start" />
          </RevealOnMount>
        </div>

        <HeroStagePanel />
      </div>
    </section>
  );
}
