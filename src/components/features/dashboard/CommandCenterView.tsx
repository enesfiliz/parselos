"use client";

import {
  ArrowRight,
  BarChart3,
  Briefcase,
  LayoutDashboard,
  Mic,
  Radar,
  ScanLine,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { ActivityFeedWidget } from "@/components/features/dashboard/ActivityFeedWidget";
import { DashboardGlobalSearch } from "@/components/features/dashboard/DashboardGlobalSearch";
import { PipelineFunnelWidget } from "@/components/features/dashboard/PipelineFunnelWidget";
import type {
  CommandCenterData,
  CommandCenterTopMetrics,
  FsboCouponListing,
  ImarWatchItem,
} from "@/lib/dashboard-command-center";
import { formatFullTRY } from "@/lib/types/deal";
import { cn } from "@/lib/utils";

export type CommandCenterUser = {
  firstName: string | null;
  fullName: string | null;
};

const WIDGET_CARD =
  "parsel-surface rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-md md:p-5";

const METRIC_CARD =
  "parsel-surface flex min-h-[96px] min-w-0 flex-col justify-between rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm transition-all duration-300 hover:border-border hover:shadow-parsel-md md:h-[104px]";

function formatToday() {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function getGreetingName(firstName?: string | null, fullName?: string | null) {
  if (firstName?.trim()) return firstName.trim();
  if (fullName?.trim()) return fullName.trim().split(/\s+/)[0];
  return null;
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "Az önce";
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

function TrendPill({
  pct,
  positiveIsGood = true,
}: {
  pct: number;
  positiveIsGood?: boolean;
}) {
  const isUp = pct >= 0;
  const isGood = positiveIsGood ? isUp : !isUp;
  const Icon = isUp ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium tabular-nums md:text-[10px]",
        isGood ? "text-emerald-400/90" : "text-red-400/90",
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {isUp ? "+" : ""}
      {pct}%
    </span>
  );
}

function PipelineMetricCard({ metrics }: { metrics: CommandCenterTopMetrics }) {
  return (
    <article className={METRIC_CARD}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium tracking-wide text-foreground/45">
          Toplam Pipeline Hacmi
        </p>
        <BarChart3 className="h-4 w-4 shrink-0 text-foreground/25" strokeWidth={1.75} />
      </div>

      <div className="flex flex-col gap-1">
        <p className="parsel-metric-value truncate text-parsel-gold">
          {formatFullTRY(metrics.pipelineHacmi)}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground md:text-[10px]">
            <span className="truncate">Aylık komisyon hedefi</span>
            <span className="shrink-0 tabular-nums">%{metrics.komisyonHedefOrani}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-parsel-gold transition-all duration-500"
              style={{ width: `${metrics.komisyonHedefOrani}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function CountMetricCard({
  label,
  value,
  icon: Icon,
  trendPct,
  positiveIsGood,
}: {
  label: string;
  value: string;
  icon: typeof Users;
  trendPct?: number;
  positiveIsGood?: boolean;
}) {
  return (
    <article className={METRIC_CARD}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium tracking-wide text-foreground/45">
          {label}
        </p>
        <Icon className="h-4 w-4 shrink-0 text-foreground/25" strokeWidth={1.75} />
      </div>

      <div className="flex items-end gap-2">
        <p className="parsel-metric-value min-w-0 flex-1 truncate text-foreground">
          {value}
        </p>
        {trendPct !== undefined ? (
          <TrendPill pct={trendPct} positiveIsGood={positiveIsGood} />
        ) : null}
      </div>
    </article>
  );
}

function ImarStatusBadge({ status }: { status: string }) {
  return (
    <span className="shrink-0 rounded-md bg-foreground/5 px-2 py-1 text-[11px] text-foreground/55">
      {status}
    </span>
  );
}

function ImarRadarPanel({ items }: { items: ImarWatchItem[] }) {
  return (
    <section className={cn(WIDGET_CARD, "flex flex-col")}>
      <h2 className="mb-2 shrink-0 text-sm font-medium tracking-wide text-foreground/70">
        İmar & Askı Takip Radarı
      </h2>

      <ul className="custom-scrollbar flex max-h-[180px] flex-col gap-2 overflow-y-auto">
        {items.map((item) => (
          <li
            key={item.id}
            className="shrink-0 rounded-xl border border-border/50 bg-background px-3 py-2 transition-all duration-300 hover:border-border"
          >
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                {item.label}
              </p>
              <ImarStatusBadge status={item.status} />
            </div>
            <p className="mt-1 truncate text-[11px] text-muted-foreground md:text-[10px]">
              Son kontrol: {formatRelativeTime(item.lastCheckedAt)}
            </p>
          </li>
        ))}
      </ul>

      <Link
        href="/imar-radari"
        className="mt-2 inline-flex shrink-0 items-center gap-1.5 text-[11px] text-foreground/35 transition-colors hover:text-muted-foreground"
      >
        İmar radarına git
        <ArrowRight className="h-3 w-3" />
      </Link>
    </section>
  );
}

const QUICK_LINKS = [
  {
    href: "/customers",
    icon: Users,
    title: "Müşteriler",
    description: "Talep ve görüşme takibi",
  },
  {
    href: "/portfolios",
    icon: Briefcase,
    title: "Portföylerim",
    description: "Aktif ilan ve varlık yönetimi",
  },
  {
    href: "/imar-radari",
    icon: Radar,
    title: "İmar Radarı",
    description: "Parsel ve imar değişiklikleri",
  },
] as const;

function SesliCrmQuickCard() {
  return (
    <Link
      href="/sesli-crm"
      className={cn(
        WIDGET_CARD,
        "group relative flex flex-col justify-between gap-4 border-primary/25 bg-gradient-to-br from-parsel-panel via-parsel-panel to-primary/[0.06] transition-all duration-300 hover:border-primary/40 hover:shadow-parsel-md md:min-h-[132px]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="parsel-section-label text-primary">Sesli CRM</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Saha görüşmesini müşteri notuna dönüştür
          </p>
        </div>
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:border-primary/30 group-hover:bg-primary/15">
          <Mic className="size-4" strokeWidth={2} />
        </span>
      </div>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors group-hover:text-primary/90">
        Sesli not ekle
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function QuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        WIDGET_CARD,
        "group flex min-h-[132px] flex-col justify-between gap-3 transition-all duration-300 hover:border-border hover:shadow-parsel-md",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-parsel-sunken/80 text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:text-primary">
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
      </div>
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/40 transition-colors group-hover:text-muted-foreground">
        Aç
        <ArrowRight className="size-3" />
      </span>
    </Link>
  );
}

function ProductQuickActions() {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-sm font-medium tracking-wide text-foreground/70">
          Günlük operasyonlar
        </h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground md:text-xs">
          Müşteri, portföy, parsel verisi ve saha notları — tek panelden erişin
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12">
        <div className="md:col-span-2 lg:col-span-5">
          <SesliCrmQuickCard />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:col-span-2 lg:col-span-7">
          {QUICK_LINKS.map((item) => (
            <QuickLinkCard key={item.href} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FsboRadarPanel({ listings }: { listings: FsboCouponListing[] }) {
  return (
    <section className={cn(WIDGET_CARD, "flex flex-col")}>
      <h2 className="mb-2 shrink-0 text-sm font-medium tracking-wide text-foreground/70">
        FSBO Kupon Radarı
      </h2>

      <ul className="custom-scrollbar flex max-h-[180px] flex-col gap-2 overflow-y-auto">
        {listings.length === 0 ? (
          <li className="shrink-0 rounded-xl border border-dashed border-border/50 px-3 py-6 text-center text-xs text-foreground/35">
            Kupon ilan sinyali yok.
          </li>
        ) : (
          listings.map((listing) => (
            <li
              key={listing.id}
              className="flex shrink-0 min-w-0 flex-col gap-2 rounded-xl border border-border/50 bg-background px-3 py-2 transition-all duration-300 hover:border-border sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground/75">
                  {listing.title}
                </p>
                <p className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="text-parsel-gold">{listing.priceFormatted}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="truncate">{listing.location}</span>
                  <span className="shrink-0 text-emerald-400/80">
                    %{listing.discountPct} ucuz
                  </span>
                </p>
              </div>
              <Link
                href="/fsbo-radar"
                className="w-full shrink-0 rounded-md border border-[#b38c56]/25 bg-parsel-gold/10 px-2 py-1.5 text-center text-[11px] font-medium text-[#d4b07a] transition-colors hover:bg-parsel-gold/15 sm:w-auto md:text-[10px]"
              >
                Fırsata Çevir
              </Link>
            </li>
          ))
        )}
      </ul>

      <Link
        href="/fsbo-radar"
        className="mt-2 inline-flex shrink-0 items-center gap-1.5 text-[11px] text-foreground/35 transition-colors hover:text-muted-foreground"
      >
        FSBO radarına git
        <ScanLine className="h-3 w-3" />
      </Link>
    </section>
  );
}

export function CommandCenterView({
  user,
  metrics,
  pipelineFunnel,
  activityFeed,
  searchIndex,
  imarWatchItems,
  fsboCouponListings,
}: {
  user: CommandCenterUser;
} & CommandCenterData) {
  const greetingName = getGreetingName(user.firstName, user.fullName);

  return (
    <div className="flex w-full flex-col gap-4 md:gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-parsel-gold">
            <LayoutDashboard className="size-4" strokeWidth={2} />
            <span className="parsel-section-label text-parsel-gold">
              Komuta merkezi
            </span>
          </div>
          <h1 className="parsel-page-title text-foreground">
            {greetingName ? `Hoş geldin, ${greetingName}` : "Hoş geldin"}
          </h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">{formatToday()}</p>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-foreground/45">
            Müşteri takibi, portföy, parsel verisi ve saha notları — günlük operasyon özeti
          </p>
        </div>
        <DashboardGlobalSearch index={searchIndex} className="lg:max-w-sm" />
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PipelineMetricCard metrics={metrics} />
        <CountMetricCard
          label="Aktif Müşteri Sayısı"
          value={metrics.aktifMusteriSayisi.toLocaleString("tr-TR")}
          icon={Users}
        />
        <CountMetricCard
          label="Kapanan Fırsatlar"
          value={metrics.kapananFirsatlar.toLocaleString("tr-TR")}
          icon={TrendingUp}
          trendPct={metrics.kapananTrendPct}
          positiveIsGood
        />
        <CountMetricCard
          label="Kaybedilen Fırsatlar"
          value={metrics.kaybedilenFirsatlar.toLocaleString("tr-TR")}
          icon={TrendingDown}
          trendPct={metrics.kaybedilenTrendPct}
          positiveIsGood={false}
        />
      </section>

      <ProductQuickActions />

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-8">
          <PipelineFunnelWidget stages={pipelineFunnel} />
        </div>
        <div className="lg:col-span-4">
          <ActivityFeedWidget items={activityFeed} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ImarRadarPanel items={imarWatchItems} />
        <FsboRadarPanel listings={fsboCouponListings} />
      </section>
    </div>
  );
}
