import {
  Activity,
  Bot,
  Briefcase,
  FileText,
  Mic,
  Radar,
  Users,
} from "lucide-react";

import { RevealOnMount } from "@/components/marketing/landing-motion";
import { cn } from "@/lib/utils";

const PANEL_CARD =
  "parsel-surface rounded-2xl border border-border/60 bg-parsel-panel";

const MAIN_PANEL_CARD =
  "hero-command-panel-main parsel-surface rounded-2xl border border-border/60 bg-parsel-panel";

const SUB_PANEL_CARD =
  "hero-command-panel-sub rounded-xl border border-border/50 bg-parsel-elevated";

const HERO_KPIS = [
  { label: "Aktif müşteri", value: "24", icon: Users },
  { label: "Açık portföy", value: "18", icon: Briefcase },
  { label: "Takip bekleyen", value: "6", icon: Activity },
  { label: "İmar uyarısı", value: "3", icon: Radar, accent: true },
] as const;

const PIPELINE_ROWS = [
  { stage: "Lead", width: "100%", volume: "₺12.4M" },
  { stage: "Gösterim", width: "72%", volume: "₺8.1M" },
  { stage: "Teklif", width: "38%", volume: "₺3.2M", gold: true },
] as const;

const ACTIVITY_ROWS = [
  { icon: Mic, text: "Sesli not — Kadıköy 3+1 görüşmesi işlendi" },
  { icon: Bot, text: "ParselAI — 3 portföy eşleşmesi önerildi" },
] as const;

const PANEL_EVENTS = [
  {
    id: "portfolio",
    icon: Briefcase,
    title: "Portföy kartı güncellendi",
    body: "Moda 3+1 · Aktif vitrin · ₺6.2M",
    placement: "left",
    accent: "primary",
  },
  {
    id: "imar",
    icon: Radar,
    title: "İmar uyarısı",
    body: "126 Ada 58 Parsel · Konut · Askı izlemede",
    placement: "right",
    accent: "gold",
  },
  {
    id: "voice",
    icon: Mic,
    title: "Sesli CRM notu",
    body: "Saha görüşmesi → müşteri profiline aktarıldı",
    placement: "bottom",
    accent: "primary",
  },
  {
    id: "parselai",
    icon: Bot,
    title: "ParselAI önerisi",
    body: "3 müşteri için portföy eşleşmesi hazır",
    placement: "bottom",
    accent: "gold",
  },
] as const;

const DESKTOP_FLOAT_EVENTS = PANEL_EVENTS.filter((event) => event.id !== "parselai");

function LiveStatusBadge() {
  return (
    <span className="landing-live-badge inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
      <span className="landing-live-badge-dot size-1.5 rounded-full bg-primary" aria-hidden />
      Canlı
    </span>
  );
}

function DashboardPreviewChrome() {
  return (
    <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-border/50 bg-parsel-elevated px-3 py-2">
      <span className="size-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
      <span className="truncate font-mono text-[11px] text-muted-foreground">
        Komuta Merkezi · Canlı önizleme
      </span>
    </div>
  );
}

function ParcelAtlasCanvas({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "hero-atlas-canvas relative overflow-hidden rounded-xl border border-border/60 bg-parsel-sunken/80",
        compact ? "hero-atlas-canvas-compact h-32" : "h-full min-h-[140px]",
      )}
      aria-hidden
    >
      <div className={cn("hero-atlas-grid absolute inset-0", compact && "opacity-70")} />
      <div className={cn("hero-atlas-blocks absolute inset-0", compact && "opacity-80")}>
        <span className="hero-atlas-block hero-atlas-block-a" />
        <span className="hero-atlas-block hero-atlas-block-b" />
        <span className="hero-atlas-block hero-atlas-block-c" />
        <span className="hero-atlas-highlight" />
      </div>
      <div className={cn("hero-atlas-radar landing-radar-sweep absolute inset-0", compact ? "opacity-20" : "opacity-30")}
        style={{
          background:
            "conic-gradient(from 200deg at 68% 42%, transparent 0deg, color-mix(in srgb, var(--primary) 40%, transparent) 36deg, transparent 70deg)",
        }}
      />
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        <span className="rounded-md border border-border/60 bg-parsel-panel/95 px-2 py-1 font-mono text-[11px] text-muted-foreground">
          126 Ada / 58 Parsel
        </span>
        <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
          İmar: Konut
        </span>
        {!compact ? (
          <span className="rounded-md border border-border/60 bg-parsel-panel/95 px-2 py-1 text-[11px] text-muted-foreground">
            Emsal: 1.20
          </span>
        ) : null}
      </div>
      {!compact ? (
        <p className="absolute bottom-2.5 right-3 font-mono text-[10px] text-muted-foreground/70">
          41.0082° N · 28.9784° E
        </p>
      ) : null}
    </div>
  );
}

function CommandCenterPanel({ showAtlasInline = false }: { showAtlasInline?: boolean }) {
  return (
    <div className={cn(MAIN_PANEL_CARD, "relative overflow-hidden p-4 sm:p-5", showAtlasInline && "p-3.5 sm:p-5")}>
      <DashboardPreviewChrome />

      <div className={cn("mb-4 flex items-start justify-between gap-3", showAtlasInline && "mb-3")}>
        <div>
          <p className="parsel-section-label flex items-center gap-2 text-primary">
            <Bot className="size-3.5" strokeWidth={2} aria-hidden />
            Komuta Merkezi
          </p>
          <p className="font-outfit mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Operasyon özeti
          </p>
        </div>
        <LiveStatusBadge />
      </div>

      {showAtlasInline ? (
        <div className="mb-3">
          <ParcelAtlasCanvas compact />
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {HERO_KPIS.map((kpi) => {
          const Icon = kpi.icon;
          const isAccent = "accent" in kpi && kpi.accent;
          return (
            <div
              key={kpi.label}
              className={cn(
                "rounded-xl border px-2.5 py-2.5 sm:px-3",
                isAccent
                  ? "border-parsel-gold/25 bg-parsel-gold/5"
                  : "border-border/50 bg-parsel-sunken/50",
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <p className="text-[11px] font-medium text-muted-foreground">{kpi.label}</p>
                <Icon
                  className={cn(
                    "size-3 shrink-0",
                    isAccent ? "text-parsel-gold" : "text-muted-foreground/60",
                  )}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </div>
              <p
                className={cn(
                  "parsel-metric-value mt-1 text-lg sm:text-xl",
                  isAccent ? "text-parsel-gold" : "text-foreground",
                )}
              >
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 xl:mt-4 xl:grid-cols-5">
        <div className={cn(SUB_PANEL_CARD, "p-3 xl:col-span-3")}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pipeline
          </p>
          <div className="mt-3 space-y-2.5">
            {PIPELINE_ROWS.map((row, index) => {
              const isGold = "gold" in row && row.gold;
              return (
              <div key={row.stage} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-medium text-foreground/80">{row.stage}</span>
                  <span
                    className={cn(
                      "tabular-nums",
                      isGold ? "text-parsel-gold" : "text-muted-foreground",
                    )}
                  >
                    {row.volume}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-background">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      isGold ? "bg-parsel-gold/70" : "bg-primary/35",
                      index === 0 && "landing-pipeline-bar",
                      index === 1 && "landing-pipeline-bar landing-pipeline-bar-2",
                      index === 2 && "landing-pipeline-bar landing-pipeline-bar-3",
                    )}
                    style={{ width: row.width }}
                  />
                </div>
              </div>
            );
            })}
          </div>
        </div>

        <div className={cn(SUB_PANEL_CARD, "p-3 xl:col-span-2")}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Son aktivite
          </p>
          <ul className="mt-3 space-y-2.5">
            {ACTIVITY_ROWS.map((row) => {
              const Icon = row.icon;
              return (
                <li key={row.text} className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-border/50 bg-parsel-panel">
                    <Icon className="size-3 text-primary" strokeWidth={1.75} aria-hidden />
                  </span>
                  <p className="text-xs leading-snug text-muted-foreground">{row.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ProductSignalGrid() {
  const signals = PANEL_EVENTS.slice(0, 4);
  return (
    <div className="mb-3 grid grid-cols-2 gap-2 sm:gap-2.5 lg:hidden">
      {signals.map((signal) => {
        const Icon = signal.icon;
        const isGold = signal.accent === "gold";
        return (
          <div
            key={signal.id}
            className={cn(
              "landing-hero-float-card rounded-xl border bg-parsel-panel/95 p-2.5 shadow-parsel-sm backdrop-blur-sm",
              isGold ? "border-parsel-gold/25" : "border-primary/20",
              signal.id === "portfolio" && "landing-glass-float",
              signal.id === "imar" && "landing-glass-float-alt",
              signal.id === "voice" && "landing-glass-float-slow",
              signal.id === "parselai" && "landing-capsule-float",
            )}
          >
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg border",
                  isGold
                    ? "border-parsel-gold/25 bg-parsel-gold/10 text-parsel-gold"
                    : "border-primary/20 bg-primary/10 text-primary",
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-foreground">{signal.title}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                  {signal.body}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PanelEventRail({
  event,
  inline = false,
}: {
  event: (typeof PANEL_EVENTS)[number];
  inline?: boolean;
}) {
  const Icon = event.icon;
  const isGold = event.accent === "gold";

  if (inline) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-parsel-panel px-3 py-2.5 shadow-parsel-sm">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10">
          <Icon className="size-3.5 text-primary" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-foreground">{event.title}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{event.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "hero-panel-event z-30 flex max-w-[220px] items-start gap-2.5 rounded-xl border bg-parsel-panel px-3.5 py-3 shadow-parsel-md backdrop-blur-sm",
        isGold ? "border-parsel-gold/25" : "border-border/60",
        event.placement === "left" && "hero-panel-event-left",
        event.placement === "right" && "hero-panel-event-right",
        event.placement === "bottom" && "hero-panel-event-bottom",
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg border",
          isGold
            ? "border-parsel-gold/25 bg-parsel-gold/10 text-parsel-gold"
            : "border-primary/15 bg-primary/10 text-primary",
        )}
      >
        <Icon className="size-3.5 text-primary" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-foreground">{event.title}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{event.body}</p>
      </div>
    </div>
  );
}

function BackLayerCard() {
  return (
    <div
      className={cn(
        PANEL_CARD,
        "hero-command-layer-back pointer-events-none absolute inset-x-4 top-6 hidden p-4 opacity-45 shadow-parsel-sm lg:block",
      )}
      aria-hidden
    >
      <p className="parsel-section-label text-muted-foreground">İmar takip</p>
      <ul className="mt-3 space-y-2">
        {["126/58 Konut", "84/12 Ticari", "210/4 Askıda"].map((item) => (
          <li
            key={item}
            className="rounded-lg border border-border/40 bg-parsel-elevated px-2.5 py-2 text-[10px] text-muted-foreground"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileCommandDeck() {
  return (
    <div className="relative">
      <ProductSignalGrid />
      <CommandCenterPanel showAtlasInline />
    </div>
  );
}

function DesktopCommandDeck() {
  return (
    <div className="hero-command-deck relative mx-auto w-full max-w-[560px] lg:max-w-none">
      <div className="hero-command-atlas-wrap pointer-events-none absolute -right-1 -top-8 z-0 hidden w-[56%] lg:block xl:-right-2 xl:-top-10 xl:w-[58%]">
        <ParcelAtlasCanvas />
      </div>

      <BackLayerCard />

      <div className="hero-command-layer-mid pointer-events-none absolute -left-2 top-14 z-10 hidden w-[40%] lg:block xl:-left-4 xl:top-16 xl:w-[42%]">
        <div className={cn(PANEL_CARD, "hero-command-panel-sub p-3 opacity-65 shadow-parsel-sm")} aria-hidden>
          <p className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            <FileText className="size-3" strokeWidth={1.75} />
            Tapu AI tarama
          </p>
          <div className="mt-2 h-1.5 w-3/4 rounded-full bg-border/80" />
          <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-border/60" />
        </div>
      </div>

      <div className="hero-command-layer-front landing-command-front relative z-20 pb-4 pt-2 lg:pt-6 lg:pb-6 xl:pt-8">
        <CommandCenterPanel />
        {DESKTOP_FLOAT_EVENTS.map((event) => (
          <PanelEventRail key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

export function ParcelCommandHero() {
  return (
    <RevealOnMount delay={180} className="relative w-full">
      <div className="hero-command-glow pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/6 via-transparent to-parsel-gold/6 blur-2xl lg:-inset-6" />
      <div className="lg:hidden">
        <MobileCommandDeck />
      </div>
      <div className="hidden lg:block">
        <DesktopCommandDeck />
      </div>
    </RevealOnMount>
  );
}
