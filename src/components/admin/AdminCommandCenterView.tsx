import { Activity, ArrowUpRight, Building2, CreditCard, Shield, Users } from "lucide-react";

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
      change: `${metrics.paidTenants} ücretli · ${metrics.brokerOfficeTenants} broker ofis`,
      changePositive: metrics.paidTenants > 0,
      sparkline: [metrics.totalTenants, metrics.brokerOfficeTenants, metrics.paidTenants],
    },
    {
      id: "deals",
      label: "Fırsatlar",
      value: metrics.totalDeals.toLocaleString("tr-TR"),
      change: `${metrics.activeDeals} aktif pipeline`,
      changePositive: metrics.activeDeals > 0,
      sparkline: [metrics.totalDeals, metrics.activeDeals, metrics.totalDeals],
    },
    {
      id: "clients",
      label: "Müşteri Kaydı",
      value: metrics.totalClients.toLocaleString("tr-TR"),
      change: `${metrics.totalProperties} portföy/ilan`,
      changePositive: metrics.totalClients > 0,
      sparkline: [metrics.totalClients, metrics.totalProperties, metrics.totalClients],
    },
    {
      id: "fsbo",
      label: "FSBO Lead",
      value: metrics.fsboLeads.toLocaleString("tr-TR"),
      change: "Radar havuzu",
      changePositive: metrics.fsboLeads > 0,
      sparkline: [metrics.fsboLeads, metrics.fsboLeads, metrics.fsboLeads],
    },
    {
      id: "licenses",
      label: "TTYB İnceleme",
      value: metrics.pendingLicenses.toLocaleString("tr-TR"),
      change: "bekleyen yetki belgesi",
      changePositive: metrics.pendingLicenses === 0,
      sparkline: [metrics.pendingLicenses, metrics.pendingLicenses, 0],
    },
    {
      id: "pro",
      label: "Pro Paket",
      value: metrics.proTenants.toLocaleString("tr-TR"),
      change: "aktif abonelik",
      changePositive: metrics.proTenants > 0,
      sparkline: [metrics.proTenants, metrics.proTenants, metrics.proTenants],
    },
    {
      id: "premium",
      label: "Broker Ofis",
      value: metrics.premiumTenants.toLocaleString("tr-TR"),
      change: `${metrics.brokerOfficeTenants} BROKERLIK kurulumu`,
      changePositive: metrics.premiumTenants > 0,
      sparkline: [metrics.premiumTenants, metrics.brokerOfficeTenants, metrics.premiumTenants],
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
    <div className="mx-auto max-w-[1680px] space-y-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-400/80">
              Superadmin
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
              Komuta Merkezi
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              ParselOS SaaS — danışman, ofis, abonelik, pipeline ve uyumluluk metrikleri.
              Tüm veriler canlı PostgreSQL üzerinden okunur.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-300/90">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Canlı PostgreSQL
            </div>
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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-emerald-500/10 bg-parsel-elevated p-5">
          <div className="mb-3 flex items-center gap-2 text-emerald-400">
            <Building2 className="size-4" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-foreground">Ofis dağılımı</h2>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Toplam kiracı</dt>
              <dd className="font-semibold tabular-nums text-foreground">{metrics.totalTenants}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Broker ofis kurulumu</dt>
              <dd className="font-semibold tabular-nums text-foreground">{metrics.brokerOfficeTenants}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Ücretli abonelik</dt>
              <dd className="font-semibold tabular-nums text-foreground">{metrics.paidTenants}</dd>
            </div>
          </dl>
        </article>
        <article className="rounded-2xl border border-emerald-500/10 bg-parsel-elevated p-5">
          <div className="mb-3 flex items-center gap-2 text-emerald-400">
            <CreditCard className="size-4" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-foreground">Paket kırılımı</h2>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Pro</dt>
              <dd className="font-semibold tabular-nums text-foreground">{metrics.proTenants}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Premium / Broker</dt>
              <dd className="font-semibold tabular-nums text-foreground">{metrics.premiumTenants}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Ücretsiz tahmini</dt>
              <dd className="font-semibold tabular-nums text-foreground">
                {Math.max(metrics.totalTenants - metrics.paidTenants, 0)}
              </dd>
            </div>
          </dl>
        </article>
        <article className="rounded-2xl border border-emerald-500/10 bg-parsel-elevated p-5">
          <div className="mb-3 flex items-center gap-2 text-emerald-400">
            <Shield className="size-4" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-foreground">Uyumluluk</h2>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">TTYB incelemede</dt>
              <dd className="font-semibold tabular-nums text-foreground">{metrics.pendingLicenses}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Aktif fırsat</dt>
              <dd className="font-semibold tabular-nums text-foreground">{metrics.activeDeals}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">FSBO havuzu</dt>
              <dd className="font-semibold tabular-nums text-foreground">{metrics.fsboLeads}</dd>
            </div>
          </dl>
        </article>
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
