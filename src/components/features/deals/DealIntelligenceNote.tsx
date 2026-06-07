"use client";

import { Sparkles } from "lucide-react";

import { resolveDealIntelligenceInsight } from "@/lib/deals/match-score";
import type { DealCardData } from "@/lib/types/deal";
import { cn } from "@/lib/utils";

type DealIntelligenceNoteProps = {
  deal: DealCardData;
  className?: string;
  /** FSBO radar satırı gibi kısa başlık + yüzde */
  listingTitle?: string;
  percent?: number;
};

export function DealIntelligenceNote({
  deal,
  className,
  listingTitle,
  percent,
}: DealIntelligenceNoteProps) {
  const insight =
    listingTitle != null && percent != null
      ? { listingTitle, percent }
      : resolveDealIntelligenceInsight(deal);

  if (!insight) return null;

  return (
    <p
      className={cn(
        "mt-2 flex w-full min-w-0 items-center gap-1.5 border-t border-white/5 pt-2 text-[11px] italic text-emerald-400/80",
        className,
      )}
    >
      <Sparkles
        className="h-3 w-3 shrink-0 text-emerald-400/70"
        strokeWidth={1.75}
      />
      <span className="min-w-0 flex-1 truncate leading-snug">
        {insight.listingTitle} için %{insight.percent} eşleşme!
      </span>
    </p>
  );
}
