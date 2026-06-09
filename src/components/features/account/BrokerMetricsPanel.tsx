"use client";

import { useEffect, useState } from "react";
import { BarChart3, Loader2, TrendingUp, Users } from "lucide-react";

import { RoleBadge } from "@/components/features/account/RoleBadge";
import { cn } from "@/lib/utils";
import type { AgentRoleType, DealStage, TenantMemberRole } from "@prisma/client";

type MetricsPayload = {
  summary: {
    teamSize: number;
    totalDeals: number;
    activeDeals: number;
    wonDeals: number;
    totalClients: number;
    conversionRate: number;
  };
  pipeline: Array<{ stage: string; label: string; count: number }>;
  memberStats: Array<{
    id: string;
    name: string;
    roleType: AgentRoleType;
    tenantMemberRole: TenantMemberRole;
    dealCount: number;
    fsboCount: number;
    lastActiveAt: string;
  }>;
  recentDeals: Array<{
    id: string;
    stageLabel: string;
    clientName: string;
    propertyTitle: string;
    agentName: string;
    updatedAt: string;
  }>;
};

const STAGE_COLORS: Record<string, string> = {
  LEAD: "bg-sky-500",
  SHOWING: "bg-violet-500",
  OFFER: "bg-amber-500",
  WON: "bg-emerald-500",
  LOST: "bg-zinc-400",
};

export function BrokerMetricsPanel() {
  const [data, setData] = useState<MetricsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/account/broker-metrics");
        const payload = (await res.json()) as { metrics?: MetricsPayload; error?: string };
        if (!res.ok) throw new Error(payload.error);
        setData(payload.metrics ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Yüklenemedi");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-56 items-center justify-center">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
        {error ?? "Metrikler yüklenemedi."}
      </div>
    );
  }

  const maxPipeline = Math.max(...data.pipeline.map((p) => p.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Ekip Büyüklüğü"
          value={data.summary.teamSize}
          hint="aktif danışman"
        />
        <MetricCard
          icon={BarChart3}
          label="Aktif Fırsat"
          value={data.summary.activeDeals}
          hint="pipeline'da"
        />
        <MetricCard
          icon={TrendingUp}
          label="Kapanış Oranı"
          value={`%${data.summary.conversionRate}`}
          hint={`${data.summary.wonDeals} kazanıldı`}
        />
        <MetricCard
          icon={Users}
          label="Müşteri"
          value={data.summary.totalClients}
          hint="ofis geneli"
        />
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-5 font-outfit text-lg font-semibold">Pipeline Dağılımı</h3>
        <div className="space-y-3">
          {data.pipeline.map((row) => (
            <div key={row.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{row.label}</span>
                <span className="tabular-nums text-muted-foreground">{row.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    STAGE_COLORS[row.stage as DealStage] ?? "bg-primary",
                  )}
                  style={{ width: `${(row.count / maxPipeline) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-outfit text-lg font-semibold">Danışman Performansı</h3>
          <div className="space-y-2">
            {data.memberStats.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{member.name}</p>
                  <RoleBadge role={member.roleType} compact className="mt-1" />
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {member.dealCount} fırsat
                  </p>
                  <p>{member.fsboCount} FSBO</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-outfit text-lg font-semibold">Son Hareketler</h3>
          <div className="space-y-2">
            {data.recentDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz fırsat kaydı yok.</p>
            ) : (
              data.recentDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="rounded-xl border border-border/60 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {deal.clientName}
                    </p>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {deal.stageLabel}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {deal.propertyTitle} · {deal.agentName}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-4 text-primary" strokeWidth={1.75} />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-outfit text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
