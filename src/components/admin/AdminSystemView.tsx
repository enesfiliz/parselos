import { Database, Globe, Server } from "lucide-react";

import type { LiveAdminMetrics } from "@/lib/admin/live-data";

type AdminSystemViewProps = {
  metrics: LiveAdminMetrics;
};

export function AdminSystemView({ metrics }: AdminSystemViewProps) {
  const checks = [
    {
      icon: Database,
      label: "PostgreSQL (Prisma)",
      status: "Bağlı",
      detail: `${metrics.totalAgents} agent · ${metrics.totalTenants} tenant kayıtlı`,
      ok: true,
    },
    {
      icon: Globe,
      label: "Uygulama URL",
      status: process.env.NEXT_PUBLIC_APP_URL ?? "Tanımsız",
      detail: "NEXT_PUBLIC_APP_URL",
      ok: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    },
    {
      icon: Server,
      label: "Ortam",
      status: process.env.NODE_ENV ?? "unknown",
      detail: `Admin parola: ${process.env.ADMIN_ACCESS_PASSWORD ? "yapılandırıldı" : "eksik"}`,
      ok: Boolean(process.env.ADMIN_ACCESS_PASSWORD),
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-400/80">
          Sistem
        </p>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Sistem & Konfigürasyon
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Canlı ortam durumu ve kritik env bayrakları.
        </p>
      </header>

      <section className="space-y-3">
        {checks.map((check) => (
          <article
            key={check.label}
            className="flex flex-wrap items-start gap-4 rounded-2xl border border-emerald-500/10 bg-parsel-elevated p-5"
          >
            <check.icon
              className={check.ok ? "size-5 text-emerald-400" : "size-5 text-amber-400"}
              strokeWidth={1.75}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">{check.label}</h2>
                <span
                  className={
                    check.ok
                      ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300"
                      : "rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300"
                  }
                >
                  {check.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{check.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <article className="rounded-2xl border border-border/60 bg-parsel-elevated p-6 text-sm text-muted-foreground">
        Üretimde eksik migration varsa hesap/ekip özellikleri hata verebilir. Son
        migration&apos;ları Supabase üzerinde{" "}
        <code className="rounded bg-background px-1.5 py-0.5 text-xs">
          npx prisma migrate deploy
        </code>{" "}
        ile uygulayın.
      </article>
    </div>
  );
}
