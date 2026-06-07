"use client";

import { Plus } from "lucide-react";

import { FsboSourceBadge } from "@/components/features/fsbo/FsboSourceBadge";
import {
  getFsboLeadBadge,
  getFsboLeadPriceInsight,
} from "@/lib/fsbo/fsbo-price-insight";
import type { FsboLeadData } from "@/lib/types/fsbo-lead";
import { cn } from "@/lib/utils";

type FsboInboxCardProps = {
  lead: FsboLeadData;
  isSelected: boolean;
  isRemoving: boolean;
  onSelect: () => void;
  onSendToDeals: (lead: FsboLeadData) => void;
};

export function FsboInboxCard({
  lead,
  isSelected,
  isRemoving,
  onSelect,
  onSendToDeals,
}: FsboInboxCardProps) {
  const metaParts = [
    lead.odaSayisi,
    lead.metrekare ? `${lead.metrekare} m²` : null,
    lead.kategori,
  ].filter(Boolean);

  const priceInsight = getFsboLeadPriceInsight(lead);
  const badge = getFsboLeadBadge(priceInsight);

  return (
    <li>
      <div
        className={cn(
          "relative mb-2 flex w-full gap-3 rounded-xl border border-border/50 bg-parsel-panel p-2.5 transition-all duration-300",
          isRemoving && "pointer-events-none translate-x-4 opacity-0",
          isSelected && "border-[#b38c56]/30",
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 gap-3 text-left"
        >
          <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lead.coverImage}
              alt={lead.title}
              className="size-full object-cover"
            />
            <div className="absolute right-1.5 top-1.5">
              <FsboSourceBadge source={lead.source} />
            </div>
          </div>

          <div className="min-w-0 flex-1 py-0.5">
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                {lead.title}
              </p>
              {!lead.isRead ? (
                <span className="mt-1 size-2 shrink-0 rounded-full bg-parsel-gold" />
              ) : null}
            </div>

            <p className="mt-2 text-base font-bold tabular-nums text-parsel-gold">
              {lead.priceFormatted}
            </p>

            {badge ? (
              <span
                className={cn(
                  "mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-medium",
                  badge.className,
                )}
              >
                {badge.label}
              </span>
            ) : null}

            <p className="mt-1 text-[11px] text-muted-foreground">
              {metaParts.join(" · ")}
            </p>

            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              {lead.location}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSendToDeals(lead);
          }}
          className="flex shrink-0 flex-col items-center justify-center self-center rounded-lg border border-[#b38c56]/30 bg-parsel-gold/5 px-2 py-1.5 text-[10px] font-semibold text-parsel-gold transition-all duration-300 hover:bg-parsel-gold/10"
          title="Fırsatlara Gönder"
        >
          <Plus className="mb-0.5 size-3.5" strokeWidth={2.5} />
          <span className="max-w-[4.5rem] text-center leading-tight">
            Fırsatlara Gönder
          </span>
        </button>
      </div>
    </li>
  );
}
