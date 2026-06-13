import { Activity, ArrowUpRight, Users } from "lucide-react";

import { AdminSparkline } from "@/components/admin/AdminSparkline";
import type {
  LiveAdminMetrics,
  LiveAdminRecentAgent,
} from "@/lib/admin/live-data";
import { cn } from "@/lib/utils";

function planBadgeClass(plan: LiveAdminRecentAgent["plan"]) {
  switch (plan) {
    case "Premium":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
    case "Pro":
      return "border-blue-500/25 bg-blue-500/10 text-blue-300";
    default:
      return "border-zinc-600/40 bg-border/50 text-muted-foreground";
  }
}

function eventBadgeClass(event: LiveAdminRecentAgent["event"]) {
  switch (event) {
    case "Yükseltme":
      return "text-emerald-400";
    case "Kayıt":
      return "text-blue-400";
    default:
      return "text-muted-foreground";
  }
}

function buildMetricCards(metrics: LiveAdminMetrics) {
  return [
    {
      id: "agents",
      label: "Toplam Danışman",
      value: metrics.totalAgents.toLocaleString("tr-TR"),
      change: `${metrics.activeAgents7d} aktif (7g)`,
      changePositive: metrics.activeAgents7d > 0,
      sparkline: [metrics.totalAgents, metrics.activeAgents7d, metrics.totalAgents],
    },
    {
      id: "tenants",
      label: "Ofis / Kiracı",
      value: metrics.totalTenants.toLocaleString("tr-TR"),
      change: `${metrics.paidTenants} ücretli paket`,
      changePositive: metrics.paidTenants > 0,
      sparkline: [metrics.totalTenants, metrics.paidTenants, metrics.totalTenants],
    },
    {
      id: "deals",
      label: "Aktif Fırsat",
      value: metrics.totalDeals.toLocaleString("tr-TR"),
      change: "CRM kanban kayıtları",
      changePositive: true,
      sparkline: [metrics.totalDeals, metrics.totalProperties, metrics.totalDeals],
    },
    {
      id: "fsbo",
      label: "FSBO Lead",
      value: metrics.fsboLeads.toLocaleString("tr-TR"),
      change: "Radar havuzu",
      changePositive: metrics.fsboLeads > 0,
      sparkline: [metrics.fsboLeads, metrics.fsboLeads, metrics.fsboLeads],
    },
  ];
}

function buildActivityLogs(metrics: LiveAdminMetrics, recent: LiveAdminRecentAgent[]) {
  const logs = recent.map((agent) => ({
    id: agent.id,
    actor: agent.name,
    action:
      agent.event === "Kayıt"
        ? "yeni hesap oluşturdu"
        : agent.event === "Yükseltme"
          ? `${agent.plan} pakete geçti`
          : "panele giriş yaptı",
    timestamp: agent.whenLabel,
    status: "success" as const,
  }));

  if (logs.length === 0) {
    return [
      {
        id: "empty",
        actor: "Sistem",
        action: `${metrics.totalAgents} danışman kayıtlı — henüz son aktivite yok`,
        timestamp: "Canlı veri",
        status: "pending" as const,
      },
    ];
  }

  return logs;
}

type AdminCommandCenterViewProps = {
  metrics: LiveAdminMetrics;
  recent: LiveAdminRecentAgent[];
};

export function AdminCommandCenterView({
  metrics,
  recent,
}: AdminCommandCenterViewProps) {
  const metricCards = buildMetricCards(metrics);
  const activityLogs = buildActivityLogs(metrics, recent);

  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-400/80">
              God Mode
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Komuta Merkezi
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              ParselOS SaaS — canlı veritabanı özeti
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-300/90">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Canlı PostgreSQL
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <article
            key={metric.id}
            className="rounded-2xl border border-emerald-500/10 bg-parsel-elevated p-5 shadow-[0_0_40px_rgba(0,0,0,0.35)]"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {metric.label}
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-2xl font-semibold tracking-tight text-foreground md:text-[1.65rem]">
                {metric.value}
              </p>
              <AdminSparkline data={metric.sparkline} />
            </div>
            <p
              className={cn(
                "mt-3 text-xs font-medium",
                metric.changePositive ? "text-emerald-400" : "text-red-400",
              )}
            >
              {metric.change}
            </p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-emerald-500/10 bg-parsel-elevated">
          <div className="flex items-center justify-between border-b border-emerald-500/10 px-5 py-4 md:px-6">
            <div className="flex items-center gap-2.5">
              <Users className="size-4 text-emerald-400" strokeWidth={1.75} />
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Son Üyeler
                </h2>
                <p className="text-xs text-muted-foreground">
                  Kayıt ve paket hareketleri
                </p>
              </div>
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground" strokeWidth={1.75} />
          </div>

          <div className="custom-scrollbar max-h-[420px] overflow-y-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead className="sticky top-0 bg-parsel-elevated text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <tr className="border-b border-border/40">
                  <th className="px-5 py-3 font-medium md:px-6">Danışman</th>
                  <th className="px-3 py-3 font-medium">Paket</th>
                  <th className="px-3 py-3 font-medium">Olay</th>
                  <th className="px-5 py-3 font-medium md:px-6">Zaman</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.03] transition-colors hover:bg-emerald-500/[0.03]"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground md:px-6">
                      {row.name}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                          planBadgeClass(row.plan),
                        )}
                      >
                        {row.plan}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-3 py-3.5 text-xs font-medium",
                        eventBadgeClass(row.event),
                      )}
                    >
                      {row.event}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground md:px-6">
                      {row.whenLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-emerald-500/10 bg-parsel-elevated">
          <div className="flex items-center justify-between border-b border-emerald-500/10 px-5 py-4 md:px-6">
            <div className="flex items-center gap-2.5">
              <Activity className="size-4 text-emerald-400" strokeWidth={1.75} />
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Platform Aktivitesi
                </h2>
                <p className="text-xs text-muted-foreground">
                  Son kullanıcı olayları
                </p>
              </div>
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
              Live
            </span>
          </div>

          <ul className="custom-scrollbar max-h-[420px] divide-y divide-white/[0.04] overflow-y-auto">
            {activityLogs.map((log) => (
              <li
                key={log.id}
                className="flex gap-3 px-5 py-4 transition-colors hover:bg-emerald-500/[0.03] md:px-6"
              >
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    log.status === "success"
                      ? "bg-emerald-500"
                      : log.status === "pending"
                        ? "bg-amber-400"
                        : "bg-red-400",
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium text-emerald-200/90">
                      {log.actor}
                    </span>
                    <span className="text-muted-foreground"> — </span>
                    {log.action}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{log.timestamp}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
