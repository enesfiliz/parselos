"use client";

import { CalendarClock, ExternalLink, Plus } from "lucide-react";

import { FsboSourceBadge } from "@/components/features/fsbo/FsboSourceBadge";
import {
  FSBO_PRIORITY_LABELS,
  FSBO_TRACKING_STATUS_LABELS,
  formatFsboRelativeTime,
} from "@/lib/fsbo/fsbo-tracking";
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
  return (
    <li>
      <div
        className={cn(
          "relative mb-2 flex w-full gap-3 rounded-xl border border-border/60 bg-parsel-panel p-3 transition-all duration-300",
          isRemoving && "pointer-events-none translate-x-4 opacity-0",
          isSelected && "border-primary/30 bg-primary/5",
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 gap-3 text-left"
        >
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lead.coverImage}
              alt={lead.title}
              className="size-full object-cover"
            />
            <div className="absolute right-1 top-1">
              <FsboSourceBadge source={lead.source} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                {lead.title}
              </p>
              {lead.isManualEntry ? (
                <span className="rounded-full border border-border/60 bg-parsel-elevated px-1.5 py-0.5 text-[9px] text-muted-foreground">
                  Manuel
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-base font-semibold tabular-nums text-parsel-gold">
              {lead.priceFormatted}
            </p>

            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
              {lead.description}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                {FSBO_TRACKING_STATUS_LABELS[lead.trackingStatus]}
              </span>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                {FSBO_PRIORITY_LABELS[lead.priority]}
              </span>
            </div>

            <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
              {lead.location}
            </p>

            <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <CalendarClock className="size-3" />
              Sonraki takip: {formatFsboRelativeTime(lead.nextFollowUpAt)}
            </p>
          </div>
        </button>

        <div className="flex shrink-0 flex-col gap-2 self-center">
          {lead.hasPublicSourceUrl ? (
            <a
              href={lead.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:border-primary/30 hover:text-primary"
              title="Kaynağı aç"
            >
              <ExternalLink className="size-3.5" />
            </a>
          ) : (
            <span
              className="inline-flex size-9 items-center justify-center rounded-lg border border-dashed border-border/60 text-[9px] text-muted-foreground"
              title="Kaynak eklenmedi"
            >
              —
            </span>
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSendToDeals(lead);
            }}
            className="inline-flex flex-col items-center justify-center rounded-lg border border-primary/25 bg-primary/10 px-2 py-1.5 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/15"
            title="Fırsatlara dönüştür"
          >
            <Plus className="mb-0.5 size-3.5" strokeWidth={2.5} />
            Fırsat
          </button>
        </div>
      </div>
    </li>
  );
}
