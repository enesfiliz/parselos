import { Brain, Cpu, Zap } from "lucide-react";

import type { LiveAdminMetrics } from "@/lib/admin/live-data";

type AdminAiMetricsViewProps = {
  metrics: LiveAdminMetrics;
};

export function AdminAiMetricsView({ metrics }: AdminAiMetricsViewProps) {
  const cards = [
    {
      icon: Brain,
      label: "Aktif danışman (7g)",
      value: metrics.activeAgents7d,
      note: "Parsel AI oturum potansiyeli",
    },
    {
      icon: Zap,
      label: "Toplam danışman",
      value: metrics.totalAgents,
      note: "Kayıtlı kullanıcı tabanı",
    },
    {
      icon: Cpu,
      label: "FSBO + CRM hacmi",
      value: metrics.fsboLeads + metrics.totalDeals,
      note: "AI araçlarına giren veri noktası",
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-400/80">
          Parsel AI
        </p>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          AI Metrikleri
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Canlı kullanıcı tabanından türetilen operasyonel metrikler.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-emerald-500/10 bg-parsel-elevated p-6"
          >
            <card.icon className="size-5 text-emerald-400" strokeWidth={1.75} />
            <p className="mt-4 text-[10px] uppercase tracking-wider text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {card.value.toLocaleString("tr-TR")}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{card.note}</p>
          </article>
        ))}
      </section>

      <article className="rounded-2xl border border-border/60 bg-parsel-elevated p-6 text-sm text-muted-foreground">
        Ayrıntılı token tüketimi ve model çağrı logları bir sonraki sürümde
        observability katmanına bağlanacak. Motor ayarları{" "}
        <strong className="text-foreground">Parsel AI Motor Kontrolü</strong>{" "}
        ekranından yönetilir.
      </article>
    </div>
  );
}
