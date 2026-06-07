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
  getFsboLeadBadge,
  getFsboLeadPriceInsight,
} from "@/lib/fsbo/fsbo-price-insight";
import type { FsboLeadData } from "@/lib/types/fsbo-lead";
import { cn } from "@/lib/utils";

const PANEL =
  "min-w-0 rounded-2xl border border-white/5 bg-[#151f23] transition-all duration-300";

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
        <Radar className="mb-3 size-8 text-zinc-700" strokeWidth={1.25} />
        <p className="text-sm text-zinc-500">
          Detay görmek için soldan bir FSBO sinyali seçin.
        </p>
      </div>
    );
  }

  const priceInsight = getFsboLeadPriceInsight(lead);
  const badge = getFsboLeadBadge(priceInsight);

  const specItems = [
    { label: "İlan No", value: lead.specs.ilanNo },
    {
      label: "Brüt m²",
      value: lead.specs.brutM2 ? `${lead.specs.brutM2} m²` : "—",
    },
    {
      label: "Net m²",
      value: lead.specs.netM2 ? `${lead.specs.netM2} m²` : "—",
    },
    { label: "Oda Sayısı", value: lead.specs.odaSayisi ?? "—" },
    { label: "Bina Yaşı", value: lead.specs.binaYasi ?? "—" },
    { label: "Isıtma Tipi", value: lead.specs.isitmaTipi ?? "—" },
    { label: "Bölge", value: lead.region },
    { label: "Kaynak", value: lead.source },
  ];

  return (
    <div className={cn(PANEL, "flex min-h-[560px] flex-col overflow-hidden")}>
      <div className="border-b border-white/5 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <FsboSourceBadge source={lead.source} className="size-7 text-xs" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {lead.islemTipi === "KIRALIK" ? "Kiralık" : "Satılık"} ·{" "}
                {lead.kategori}
              </p>
              <h2 className="font-outfit text-lg font-semibold text-zinc-50">
                {lead.title}
              </h2>
            </div>
          </div>
          <a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border border-white/10 p-2 text-zinc-400 transition-all duration-300 hover:border-[#b38c56]/30 hover:text-[#b38c56]"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>

        <FsboImageCarousel images={lead.images} title={lead.title} />
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-2xl font-bold tabular-nums text-[#b38c56]">
            {lead.priceFormatted}
          </p>
          {badge ? (
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                badge.className,
              )}
            >
              {badge.label}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/5 bg-[#09090b] p-4 md:grid-cols-4">
          {specItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-white/5 bg-[#151f23] px-3 py-2.5 transition-all duration-300 hover:border-white/10"
            >
              <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-600">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-200">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-white/5 bg-[#09090b] p-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
            İlan Açıklaması
          </p>
          <p className="text-sm leading-relaxed text-zinc-400">
            {lead.description}
          </p>
          <p className="mt-3 text-xs text-zinc-600">{lead.location}</p>
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
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#b38c56] px-5 py-2.5 text-sm font-bold text-black transition-all duration-300 hover:bg-[#c9a06a] sm:flex-none"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Fırsatlara Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
