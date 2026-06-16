"use client";

import {
  ExternalLink,
  Plus,
  Radar,
  Trash2,
  X,
} from "lucide-react";

import { FsboImageCarousel } from "@/components/features/fsbo/FsboImageCarousel";
import { FsboSourceBadge } from "@/components/features/fsbo/FsboSourceBadge";
import {
  FSBO_PRIORITY_LABELS,
  FSBO_PRODUCT_DISCLAIMER,
  FSBO_TRACKING_STATUS_LABELS,
  formatFsboRelativeTime,
} from "@/lib/fsbo/fsbo-tracking";
import type { FsboLeadData } from "@/lib/types/fsbo-lead";
import { cn } from "@/lib/utils";

const PANEL =
  "min-w-0 rounded-2xl border border-border/50 bg-parsel-panel transition-all duration-300";

type FsboDetailPanelProps = {
  lead: FsboLeadData | null;
  onDiscard: (lead: FsboLeadData) => void;
  onSendToDeals: (lead: FsboLeadData) => void;
};

export function FsboDetailPanel({
  lead,
  onDiscard,
  onSendToDeals,
}: FsboDetailPanelProps) {
  if (!lead) {
    return (
      <div
        className={cn(
          PANEL,
          "flex min-h-[320px] flex-col items-center justify-center p-6 text-center sm:min-h-[560px] sm:p-8",
        )}
      >
        <Radar className="mb-3 size-8 text-muted-foreground" strokeWidth={1.25} />
        <p className="text-sm text-muted-foreground">
          Detay görmek için soldan bir fırsat kaydı seçin.
        </p>
      </div>
    );
  }

  const specItems = [
    { label: "Takip durumu", value: FSBO_TRACKING_STATUS_LABELS[lead.trackingStatus] },
    { label: "Öncelik", value: FSBO_PRIORITY_LABELS[lead.priority] },
    {
      label: "Sonraki takip",
      value: formatFsboRelativeTime(lead.nextFollowUpAt),
    },
    { label: "m²", value: lead.metrekare ? `${lead.metrekare} m²` : "—" },
    { label: "Bölge", value: lead.region },
    { label: "Kaynak", value: lead.isManualEntry ? "Manuel kayıt" : lead.source },
  ];

  return (
    <div className={cn(PANEL, "flex min-h-[560px] flex-col overflow-hidden")}>
      <div className="border-b border-border/50 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <FsboSourceBadge source={lead.source} className="size-7 text-xs" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {lead.islemTipi === "KIRALIK" ? "Kiralık" : "Satılık"} ·{" "}
                {lead.kategori}
              </p>
              <h2 className="font-outfit text-lg font-semibold text-foreground">
                {lead.title}
              </h2>
            </div>
          </div>
          {lead.hasPublicSourceUrl ? (
            <a
              href={lead.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              title="Kaynağı aç"
            >
              <ExternalLink className="size-4" />
            </a>
          ) : null}
        </div>

        <FsboImageCarousel images={lead.images} title={lead.title} />
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-2xl font-bold tabular-nums text-parsel-gold">
            {lead.priceFormatted}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/50 bg-background p-4 md:grid-cols-4">
          {specItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border/50 bg-parsel-panel px-3 py-2.5 transition-all duration-300 hover:border-border"
            >
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-border/50 bg-background p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Not / özet
          </p>
          <p className="text-sm leading-relaxed text-foreground/85">
            {lead.description}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{lead.location}</p>
          {!lead.hasPublicSourceUrl ? (
            <p className="mt-2 text-xs text-muted-foreground">Kaynak linki eklenmedi.</p>
          ) : null}
        </div>

        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-foreground/80">
          {FSBO_PRODUCT_DISCLAIMER}
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <button
            type="button"
            onClick={() => onDiscard(lead)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all duration-300 hover:bg-red-500/15"
          >
            <Trash2 className="size-4" />
            Çöpe At
            <X className="size-3.5 opacity-70" />
          </button>
          <button
            type="button"
            onClick={() => onSendToDeals(lead)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:flex-none"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Fırsatlara Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
