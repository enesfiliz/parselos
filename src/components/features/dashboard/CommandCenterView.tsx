"use client";

import {
  ArrowRight,
  BarChart3,
  LayoutDashboard,
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
  "rounded-2xl border border-white/5 bg-[#151f23] p-3 md:p-4";

const METRIC_CARD =
  "flex min-h-[88px] min-w-0 flex-col justify-between rounded-2xl border border-white/5 bg-[#151f23] p-3 transition-all duration-300 hover:border-white/10 md:h-[96px] md:p-4";

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
        <p className="truncate text-xs font-medium tracking-wide text-white/45">
          Toplam Pipeline Hacmi
        </p>
        <BarChart3 className="h-4 w-4 shrink-0 text-white/25" strokeWidth={1.75} />
      </div>

      <div className="flex flex-col gap-1">
        <p className="truncate text-lg font-semibold tabular-nums tracking-tight text-[#b38c56]">
          {formatFullTRY(metrics.pipelineHacmi)}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-[11px] text-white/40 md:text-[10px]">
            <span className="truncate">Aylık komisyon hedefi</span>
            <span className="shrink-0 tabular-nums">%{metrics.komisyonHedefOrani}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#09090b]">
            <div
              className="h-full rounded-full bg-[#b38c56] transition-all duration-500"
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
        <p className="truncate text-xs font-medium tracking-wide text-white/45">
          {label}
        </p>
        <Icon className="h-4 w-4 shrink-0 text-white/25" strokeWidth={1.75} />
      </div>

      <div className="flex items-end gap-2">
        <p className="min-w-0 flex-1 truncate text-lg font-semibold tabular-nums tracking-tight text-white/90">
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
    <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[11px] text-white/55">
      {status}
    </span>
  );
}

function ImarRadarPanel({ items }: { items: ImarWatchItem[] }) {
  return (
    <section className={cn(WIDGET_CARD, "flex flex-col")}>
      <h2 className="mb-2 shrink-0 text-sm font-medium tracking-wide text-white/70">
        İmar & Askı Takip Radarı
      </h2>

      <ul className="custom-scrollbar flex max-h-[180px] flex-col gap-2 overflow-y-auto">
        {items.map((item) => (
          <li
            key={item.id}
            className="shrink-0 rounded-xl border border-white/5 bg-[#09090b] px-3 py-2 transition-all duration-300 hover:border-white/10"
          >
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="min-w-0 flex-1 truncate text-xs text-white/60">
                {item.label}
              </p>
              <ImarStatusBadge status={item.status} />
            </div>
            <p className="mt-1 truncate text-[11px] text-white/30 md:text-[10px]">
              Son kontrol: {formatRelativeTime(item.lastCheckedAt)}
            </p>
          </li>
        ))}
      </ul>

      <Link
        href="/imar-radari"
        className="mt-2 inline-flex shrink-0 items-center gap-1.5 text-[11px] text-white/35 transition-colors hover:text-white/60"
      >
        İmar radarına git
        <ArrowRight className="h-3 w-3" />
      </Link>
    </section>
  );
}

function FsboRadarPanel({ listings }: { listings: FsboCouponListing[] }) {
  return (
    <section className={cn(WIDGET_CARD, "flex flex-col")}>
      <h2 className="mb-2 shrink-0 text-sm font-medium tracking-wide text-white/70">
        FSBO Kupon Radarı
      </h2>

      <ul className="custom-scrollbar flex max-h-[180px] flex-col gap-2 overflow-y-auto">
        {listings.length === 0 ? (
          <li className="shrink-0 rounded-xl border border-dashed border-white/5 px-3 py-6 text-center text-xs text-white/35">
            Kupon ilan sinyali yok.
          </li>
        ) : (
          listings.map((listing) => (
            <li
              key={listing.id}
              className="flex shrink-0 min-w-0 flex-col gap-2 rounded-xl border border-white/5 bg-[#09090b] px-3 py-2 transition-all duration-300 hover:border-white/10 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white/75">
                  {listing.title}
                </p>
                <p className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5 text-[11px] text-white/40">
                  <span className="text-[#b38c56]">{listing.priceFormatted}</span>
                  <span className="text-white/20">•</span>
                  <span className="truncate">{listing.location}</span>
                  <span className="shrink-0 text-emerald-400/80">
                    %{listing.discountPct} ucuz
                  </span>
                </p>
              </div>
              <Link
                href="/fsbo-radar"
                className="w-full shrink-0 rounded-md border border-[#b38c56]/25 bg-[#b38c56]/10 px-2 py-1.5 text-center text-[11px] font-medium text-[#d4b07a] transition-colors hover:bg-[#b38c56]/15 sm:w-auto md:text-[10px]"
              >
                Fırsata Çevir
              </Link>
            </li>
          ))
        )}
      </ul>

      <Link
        href="/fsbo-radar"
        className="mt-2 inline-flex shrink-0 items-center gap-1.5 text-[11px] text-white/35 transition-colors hover:text-white/60"
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 bg-[#09090b] md:gap-4">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[#b38c56]">
            <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] md:text-[10px]">
              Ultra-Genişletilmiş Analitik Kokpit
            </span>
          </div>
          <h1 className="font-outfit text-xl font-semibold tracking-tight text-white/90 md:text-2xl lg:text-3xl">
            {greetingName ? `Hoş geldin, ${greetingName}` : "Hoş geldin"}
          </h1>
          <p className="mt-1 text-sm text-white/70">{formatToday()}</p>
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
