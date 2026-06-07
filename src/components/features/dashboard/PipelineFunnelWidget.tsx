"use client";

import type { PipelineFunnelStage } from "@/lib/dashboard-command-center";
import type { DealStageId } from "@/lib/types/deal";
import { formatCompactTRY } from "@/lib/types/deal";
import { cn } from "@/lib/utils";

const WIDGET_CARD =
  "rounded-2xl border border-border/50 bg-parsel-panel p-3 md:p-4";

const STAGE_FILL: Record<
  DealStageId,
  string
> = {
  LEAD: "bg-foreground/10",
  SHOWING: "bg-gradient-to-r from-white/10 to-white/30",
  OFFER: "bg-gradient-to-r from-[#b38c56]/40 to-[#b38c56]/80",
  WON: "bg-gradient-to-r from-emerald-500/50 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
  LOST: "bg-foreground/5",
};

const FALLBACK_WIDTHS: Record<DealStageId, number> = {
  LEAD: 100,
  SHOWING: 75,
  OFFER: 40,
  WON: 15,
  LOST: 8,
};

function resolveFillWidth(stage: PipelineFunnelStage, maxVolume: number) {
  if (maxVolume <= 0 || stage.volumeTL <= 0) {
    return FALLBACK_WIDTHS[stage.stage] ?? 12;
  }

  const ratio = Math.round((stage.volumeTL / maxVolume) * 100);
  return Math.max(12, Math.min(100, ratio));
}

export function PipelineFunnelWidget({
  stages,
  className,
}: {
  stages: PipelineFunnelStage[];
  className?: string;
}) {
  const maxVolume = Math.max(...stages.map((s) => s.volumeTL), 1);

  return (
    <section className={cn(WIDGET_CARD, "flex flex-col", className)}>
      <div className="mb-2 shrink-0">
        <h2 className="text-sm font-medium tracking-wide text-foreground/70">
          Pipeline Funnel Analizi
        </h2>
        <p className="text-[11px] text-foreground/35 md:text-[10px]">
          Aşama bazlı hacim ve müşteri yoğunluğu
        </p>
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 border-r border-dashed border-border/50"
        />

        <div className="flex flex-col gap-3">
          {stages.map((stage) => {
            const widthPct = resolveFillWidth(stage, maxVolume);
            const fillClass =
              STAGE_FILL[stage.stage] ?? "bg-foreground/10";

            return (
              <div key={stage.stage} className="group relative w-full">
                <div className="mb-1.5 flex items-end justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground/90">
                    <span className="truncate">{stage.label}</span>
                    <span className="shrink-0 rounded bg-foreground/5 px-1.5 py-0.5 text-[11px] text-muted-foreground md:text-[10px]">
                      {stage.dealCount}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-bold tracking-tight text-parsel-gold">
                    {formatCompactTRY(stage.volumeTL)}
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full border border-border/50 bg-background shadow-inner">
                  <div
                    className={cn(
                      "relative h-full overflow-hidden rounded-full transition-all duration-500",
                      fillClass,
                    )}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
