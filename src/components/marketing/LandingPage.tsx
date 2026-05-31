import {
  Activity,
  Cloud,
  FileText,
  Landmark,
  LayoutDashboard,
  Lock,
  MapPin,
  Mic,
  ScanLine,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  SignInNavButton,
  SignInOutlineButton,
  SignUpShineButton,
} from "@/components/marketing/LandingAuthButtons";
import {
  NoiseTexture,
  RevealOnMount,
  RevealOnScroll,
  SpotlightCard,
} from "@/components/marketing/landing-motion";
import { cn } from "@/lib/utils";

const GOLD_TEXT = "text-[#C9B896]";
const GOLD_BORDER = "border-[#C9B896]/30";
const GOLD_MUTED = "text-[#C9B896]/65";
const INDIGO_TEXT = "text-indigo-300/90";

const TRUST_ITEMS = [
  { label: "Uçtan uca şifreleme", icon: Lock },
  { label: "Kurumsal güvenlik", icon: Shield },
  { label: "Bulut altyapısı", icon: Cloud },
] as const;

function PageBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/40 via-[#09090b] to-[#09090b]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 0%, rgba(212, 196, 168, 0.07), transparent 68%)",
        }}
      />
    </>
  );
}

function DashboardMockup() {
  return (
    <div
      className="relative mx-auto mt-20 max-w-[1180px] overflow-visible pb-16 mb-10 lg:mt-24 lg:pb-24 lg:mb-12"
      style={{ perspective: "2200px" }}
    >
      <div className="landing-dashboard-float relative z-10 mx-auto max-w-[1080px] origin-center overflow-visible">
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/50 backdrop-blur-xl",
            "[transform:rotateX(10deg)_rotateY(-8deg)] [transform-style:preserve-3d]",
          )}
        >
          {/* Mock chrome */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                <Sparkles className={cn("size-3.5", GOLD_TEXT)} strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs font-semibold text-zinc-200">Komuta Merkezi</p>
                <p className="text-[10px] font-medium text-zinc-500">Parselos Dashboard</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider",
                  GOLD_BORDER,
                  "bg-[#C9B896]/10",
                  GOLD_TEXT,
                )}
              >
                SPK Uyumlu
              </span>
              <span className="rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-300/90">
                TKGM Bağlı
              </span>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3">
            {[
              { label: "Toplam Müşteri", value: "128", icon: Users },
              { label: "Üretilen Rapor", value: "47", icon: FileText },
              { label: "Sistem", value: "Aktif", icon: Activity },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-zinc-100">
                      {value}
                    </p>
                  </div>
                  <Icon className="size-4 text-zinc-600" strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 px-6 pb-6 md:grid-cols-5">
            <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 md:col-span-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Haftalık Aktivite
              </p>
              <div className="flex h-24 items-end justify-between gap-1.5 pt-2">
                {[40, 65, 52, 78, 92, 38, 30].map((h, i) => (
                  <div
                    key={i}
                    className="w-full rounded-sm bg-zinc-700/80"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 md:col-span-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Son Müşteriler
              </p>
              <div className="space-y-2.5">
                {[88, 72, 94, 66].map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="size-7 shrink-0 rounded-full bg-zinc-800/80" />
                    <div className="flex-1 space-y-1.5">
                      <div
                        className="h-2 rounded-full bg-zinc-700/70 blur-[0.3px]"
                        style={{ width: `${w}%` }}
                      />
                      <div
                        className="h-1.5 rounded-full bg-zinc-800/90"
                        style={{ width: `${w * 0.6}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-[72%] z-0 h-36 bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent lg:top-[78%] lg:h-40"
        aria-hidden
      />
    </div>
  );
}

function BentoShell({
  children,
  className,
  accent = "gold",
  revealDelay = 0,
}: {
  children: ReactNode;
  className?: string;
  accent?: "gold" | "indigo";
  revealDelay?: number;
}) {
  return (
    <RevealOnScroll delay={revealDelay} className={cn("h-full min-w-0", className)}>
      <SpotlightCard className="h-full" accent={accent}>
        {children}
      </SpotlightCard>
    </RevealOnScroll>
  );
}

function BentoCardLayout({
  text,
  visual,
}: {
  text: ReactNode;
  visual: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col justify-between overflow-hidden">
      <div className="p-8 lg:p-10">{text}</div>
      <div className="mt-auto w-full shrink-0">{visual}</div>
    </div>
  );
}

function MapPreview() {
  return (
    <div className="relative h-48 w-full overflow-hidden border-t border-white/[0.06] bg-[#0c0c0e] lg:h-56">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(201,184,150,0.12),transparent_55%)]" />
      <div className="absolute left-[38%] top-[42%] flex flex-col items-center">
        <span className="flex size-9 items-center justify-center rounded-full border border-[#C9B896]/40 bg-[#C9B896]/15">
          <MapPin className={cn("size-4", GOLD_TEXT)} strokeWidth={1.75} />
        </span>
        <span className="mt-2 rounded-md border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 backdrop-blur-sm">
          Ada 124 · Parsel 8
        </span>
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[10px] font-medium text-zinc-500">
        <span>TKGM CBS</span>
        <span className={GOLD_MUTED}>Uydu katmanı</span>
      </div>
    </div>
  );
}

function DocumentScanPreview() {
  return (
    <div className="mt-auto flex w-full min-h-[180px] flex-1 flex-col justify-end border-t border-white/[0.06] px-8 pb-8 pt-6 lg:min-h-[220px] lg:px-10 lg:pb-10">
      <div className="relative mx-auto flex h-full min-h-[200px] w-full max-w-[220px] flex-col overflow-hidden rounded-t-xl border border-b-0 border-white/10 bg-zinc-900/50 p-5 lg:min-h-[240px]">
        <div className="space-y-2.5">
          {[100, 85, 92, 70, 88, 76].map((w, i) => (
            <div
              key={i}
              className="h-2 rounded-full bg-zinc-700/60"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
        <div className="landing-doc-scan-line absolute inset-x-3 h-px bg-gradient-to-r from-transparent via-[#C9B896]/80 to-transparent shadow-[0_0_12px_rgba(201,184,150,0.5)]" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 rounded-md border border-white/10 bg-black/50 py-2 backdrop-blur-sm">
          <ScanLine className={cn("size-3.5", GOLD_TEXT)} strokeWidth={1.75} />
          <span className="text-[10px] font-semibold text-zinc-300">Taranıyor…</span>
        </div>
      </div>
    </div>
  );
}

function CrmWavePreview() {
  return (
    <div className="relative mt-auto border-t border-white/[0.06] px-8 pb-6 pt-5 lg:px-10 lg:pb-8">
      <div className="flex items-end justify-center gap-1.5 overflow-hidden">
        {[32, 48, 40, 64, 52, 38, 44, 56].map((h, i) => (
          <div
            key={i}
            className="w-2.5 rounded-full bg-[#C9B896]/30 transition-colors duration-500 group-hover:bg-[#C9B896]/55"
            style={{ height: `${h}px`, marginBottom: i % 2 === 0 ? "-4px" : "0" }}
          />
        ))}
      </div>
    </div>
  );
}

function FinansMetricPreview() {
  return (
    <div className="mt-auto border-t border-white/[0.06] px-8 pb-6 pt-5 lg:px-10 lg:pb-8">
      <div className="-mx-1 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
        <TrendingUp className={cn("size-4 shrink-0", INDIGO_TEXT)} strokeWidth={1.75} />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Kira çarpanı
          </p>
          <p className="text-lg font-semibold tabular-nums text-zinc-200">14,2</p>
        </div>
      </div>
    </div>
  );
}

function FeaturesBento() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-2 lg:gap-6 lg:items-stretch">
      {/* Sol üst — Ekspertiz & TKGM */}
      <BentoShell
        className="col-span-1 min-w-0 lg:col-span-2 lg:col-start-1 lg:row-start-1"
        accent="gold"
        revealDelay={0}
      >
        <BentoCardLayout
          text={
            <>
              <span
                className={cn(
                  "inline-flex rounded-xl border p-3 transition-colors duration-500",
                  GOLD_BORDER,
                  "bg-[#C9B896]/[0.06] group-hover:bg-[#C9B896]/15",
                )}
              >
                <MapPin
                  className={cn(
                    "size-6 transition-colors duration-500",
                    GOLD_TEXT,
                    "group-hover:text-[#E2D4B8]",
                  )}
                  strokeWidth={1.75}
                />
              </span>
              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-50 lg:text-[1.65rem]">
                Akıllı Ekspertiz & TKGM
              </h3>
              <p className="mt-3 text-base font-medium leading-relaxed text-zinc-400 lg:text-lg">
                SPK uyumlu raporlar, parsel sorgusu ve uydu haritası — tek akışta,
                saniyeler içinde.
              </p>
            </>
          }
          visual={<MapPreview />}
        />
      </BentoShell>

      {/* Sağ dikey — Tapu AI */}
      <BentoShell
        className="col-span-1 min-w-0 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1"
        accent="indigo"
        revealDelay={120}
      >
        <div className="flex h-full min-h-0 flex-col justify-between overflow-hidden">
          <div className="p-8 lg:p-10">
            <span
              className={cn(
                "inline-flex rounded-xl border border-indigo-400/25 bg-indigo-500/10 p-3",
                "transition-colors duration-500 group-hover:border-indigo-400/45 group-hover:bg-indigo-500/20",
              )}
            >
              <FileText
                className={cn(
                  "size-6",
                  INDIGO_TEXT,
                  "transition-colors duration-500 group-hover:text-indigo-200",
                )}
                strokeWidth={1.75}
              />
            </span>
            <h3 className="mt-6 text-xl font-semibold tracking-tight text-zinc-50">
              Tapu AI
            </h3>
            <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-400 lg:text-[15px]">
              Sözleşme ve tapu belgelerini tarayın; özet ve riskler anında.
            </p>
          </div>
          <DocumentScanPreview />
        </div>
      </BentoShell>

      {/* Sol alt — Sesli CRM */}
      <BentoShell
        className="col-span-1 min-w-0 lg:col-span-1 lg:col-start-1 lg:row-start-2"
        accent="gold"
        revealDelay={240}
      >
        <BentoCardLayout
          text={
            <>
              <span
                className={cn(
                  "inline-flex rounded-xl border p-3 transition-colors duration-500",
                  GOLD_BORDER,
                  "bg-[#C9B896]/[0.06] group-hover:bg-[#C9B896]/15",
                )}
              >
                <Mic
                  className={cn("size-5", GOLD_TEXT, "group-hover:text-[#E2D4B8]")}
                  strokeWidth={1.75}
                />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-50">
                Sesli CRM
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-400">
                Görüşmeleri kaydedin; notlar ve görevler otomatik oluşsun.
              </p>
            </>
          }
          visual={<CrmWavePreview />}
        />
      </BentoShell>

      {/* Sol alt — Finans Motoru */}
      <BentoShell
        className="col-span-1 min-w-0 lg:col-span-1 lg:col-start-2 lg:row-start-2"
        accent="indigo"
        revealDelay={360}
      >
        <BentoCardLayout
          text={
            <>
              <span
                className={cn(
                  "inline-flex rounded-xl border border-indigo-400/25 bg-indigo-500/10 p-3",
                  "transition-colors duration-500 group-hover:border-indigo-400/45 group-hover:bg-indigo-500/20",
                )}
              >
                <Landmark
                  className={cn("size-5", INDIGO_TEXT, "group-hover:text-indigo-200")}
                  strokeWidth={1.75}
                />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-zinc-50">
                Finans Motoru
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-400">
                Kredi simülasyonu, ROI ve amortisman — portföy matematiği net.
              </p>
            </>
          }
          visual={<FinansMetricPreview />}
        />
      </BentoShell>
    </div>
  );
}

export function LandingPage() {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-x-hidden bg-[#09090b] text-zinc-200",
        "font-[family-name:var(--font-plus-jakarta)]",
      )}
    >
      <PageBackground />
      <NoiseTexture />

      <div className="relative z-10">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-8 py-5 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-lg border",
                GOLD_BORDER,
                "bg-[#C9B896]/[0.08]",
              )}
            >
              <Sparkles className={cn("size-4", GOLD_TEXT)} strokeWidth={1.75} />
            </span>
            <span className="text-base font-semibold tracking-tight text-zinc-100">
              Parselos
            </span>
          </Link>
          <SignInNavButton
            className={cn(
              "rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors duration-300",
              GOLD_BORDER,
              "text-[#C9B896] hover:bg-[#C9B896]/10",
            )}
          />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-visible px-8 pb-24 pt-36 lg:px-12 lg:pb-32 lg:pt-44">
        <div className="mx-auto max-w-[1400px]">
          <div className="mx-auto max-w-[920px] text-center">
            <RevealOnMount delay={0}>
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.24em]",
                GOLD_MUTED,
              )}
            >
              Gayrimenkul Operasyon Platformu
            </p>
            </RevealOnMount>
            <RevealOnMount delay={120}>
            <h1
              className={cn(
                "mt-8 text-5xl font-bold leading-[1.02] tracking-tighter sm:text-6xl lg:text-[4.5rem] lg:leading-[1.02]",
                "bg-gradient-to-b from-zinc-200 via-zinc-50 to-white bg-clip-text text-transparent",
              )}
            >
              Gayrimenkulde
              <br />
              Yapay Zeka Devrimi
            </h1>
            </RevealOnMount>
            <RevealOnMount delay={240}>
            <p className="mx-auto mt-10 max-w-[680px] text-lg font-medium leading-relaxed text-zinc-400 lg:text-xl">
              SPK standartlarında ekspertiz, yapay zeka destekli müşteri yönetimi
              ve TKGM entegrasyonu ile portföyünüzü saniyeler içinde yönetin.
            </p>
            </RevealOnMount>
            <RevealOnMount delay={360}>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <SignUpShineButton>Ücretsiz Başla</SignUpShineButton>
              <SignInOutlineButton>Giriş Yap</SignInOutlineButton>
            </div>
            </RevealOnMount>
          </div>

          <RevealOnMount delay={520}>
          <DashboardMockup />
          </RevealOnMount>
        </div>
      </section>

      {/* Sosyal kanıt */}
      <section className="relative border-y border-white/[0.06] px-8 py-28 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <RevealOnScroll>
          <p className="text-center text-lg font-semibold leading-relaxed text-zinc-300">
            Türkiye&apos;nin en yenilikçi gayrimenkul danışmanları tarafından
            kullanılıyor
          </p>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-20 gap-y-10">
            {TRUST_ITEMS.map(({ label, icon: Icon }, index) => (
              <RevealOnScroll key={label} delay={index * 100} className="flex">
              <div className="flex items-center gap-3.5">
                <span className="flex size-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02]">
                  <Icon className={cn("size-[18px]", GOLD_TEXT)} strokeWidth={1.75} />
                </span>
                <span className="text-sm font-semibold text-zinc-400">{label}</span>
              </div>
              </RevealOnScroll>
            ))}
          </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Bento özellikler */}
      <section
        id="ozellikler"
        className="relative scroll-mt-28 px-8 py-32 lg:px-12 lg:py-40"
      >
        <div className="mx-auto max-w-[1400px]">
          <RevealOnScroll>
          <div className="mb-16 max-w-2xl lg:mb-24">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.24em]",
                GOLD_MUTED,
              )}
            >
              Özellikler
            </p>
            <h2 className="mt-6 text-3xl font-bold tracking-tighter text-zinc-50 sm:text-4xl lg:text-5xl">
              Tek platformda tüm operasyon
            </h2>
            <p className="mt-6 text-lg font-medium leading-relaxed text-zinc-400">
              Ekspertizden finansa, tapu okumadan sesli CRM&apos;e — asimetrik,
              modüler ve güvenilir bir ekosistem.
            </p>
          </div>
          </RevealOnScroll>

          <FeaturesBento />
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-8 pb-36 lg:px-12 lg:pb-44">
        <RevealOnScroll>
        <div
          className={cn(
            "mx-auto max-w-[1400px] rounded-2xl border border-white/10 bg-white/[0.02] px-10 py-20 text-center lg:px-28 lg:py-28",
            "transition-all duration-500 hover:-translate-y-1 hover:border-[#C9B896]/25 hover:shadow-2xl hover:shadow-black/50",
          )}
        >
          <LayoutDashboard className={cn("mx-auto size-8", GOLD_MUTED)} strokeWidth={1.5} />
          <h3 className="mt-8 text-3xl font-bold tracking-tighter text-zinc-50 sm:text-4xl">
            Portföyünüzü bir üst seviyeye taşıyın
          </h3>
          <p className="mx-auto mt-6 max-w-lg text-lg font-medium leading-relaxed text-zinc-400">
            Dakikalar içinde hesap oluşturun, ilk ekspertiz raporunuzu üretin.
          </p>
          <SignUpShineButton className="mt-12 px-12">Ücretsiz Başla</SignUpShineButton>
        </div>
        </RevealOnScroll>
      </section>

      <footer className="relative border-t border-white/[0.06] px-8 py-14 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
            <Sparkles className={cn("size-3.5", GOLD_MUTED)} strokeWidth={1.75} />
            Parselos © {new Date().getFullYear()}
          </span>
          <span className="text-sm font-semibold text-zinc-500">
            Yapay zeka destekli gayrimenkul operasyonları
          </span>
        </div>
      </footer>
      </div>
    </div>
  );
}
