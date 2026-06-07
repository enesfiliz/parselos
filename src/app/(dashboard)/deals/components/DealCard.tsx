"use client";

import { MapPin, StickyNote } from "lucide-react";

import { DealIntelligenceNote } from "@/components/features/deals/DealIntelligenceNote";
import type { DealCardData } from "@/lib/types/deal";
import {
  formatFullTRY,
  resolveDealBudgetTL,
} from "@/lib/types/deal";
import { cn } from "@/lib/utils";

function resolveLocation(deal: DealCardData) {
  if (deal.client.mulkTipi) return deal.client.mulkTipi;
  if (deal.listingIntel?.location) return deal.listingIntel.location;

  const parts = [
    deal.property.mahalle,
    deal.property.ilce,
    deal.property.il,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Lokasyon belirtilmedi";
}

function resolveSonNot(deal: DealCardData) {
  if (deal.notlar?.trim()) {
    return deal.notlar.trim().split("\n")[0];
  }

  const pending = deal.tasks?.find((task) => !task.completed);
  if (pending) return pending.label;

  if (deal.sonIletisim) {
    return `Son görüşme: ${deal.sonIletisim}`;
  }

  return "Operasyon notu eklenmedi";
}

function tagStyles(etiket: string | null | undefined) {
  const value = etiket?.toLocaleLowerCase("tr-TR") ?? "";

  if (value.includes("acil")) {
    return "border-red-500/30 bg-red-500/15 text-red-300";
  }
  if (value.includes("kredi")) {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  }
  return "border-border bg-background/60 text-muted-foreground";
}

export type DealCardProps = {
  deal: DealCardData;
  isDragging?: boolean;
};

export function DealCard({ deal, isDragging }: DealCardProps) {
  const displayName = deal.client.adSoyad;
  const budget = formatFullTRY(resolveDealBudgetTL(deal));
  const location = resolveLocation(deal);
  const sonNot = resolveSonNot(deal);

  return (
    <article
      className={cn(
        "rounded-2xl border border-border/50 bg-parsel-panel p-4 shadow-xl",
        "cursor-pointer hover:border-parsel-gold/30 hover:shadow-2xl hover:shadow-black/20",
        isDragging && "border-[#b38c56]/35 shadow-2xl ring-1 ring-[#b38c56]/30",
      )}
    >
      {deal.etiket ? (
        <span
          className={cn(
            "mb-3 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            tagStyles(deal.etiket),
          )}
        >
          {deal.etiket}
        </span>
      ) : null}

      <h3 className="text-sm font-bold tracking-tight text-foreground">
        {displayName}
      </h3>

      <p className="mt-2 text-2xl font-bold tracking-tight text-parsel-gold">
        {budget}
      </p>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5 shrink-0 text-foreground0" strokeWidth={1.75} />
        <span className="truncate">{location}</span>
      </div>

      <DealIntelligenceNote deal={deal} />

      <footer className="mt-4 flex items-start gap-1.5 border-t border-border/50 pt-3">
        <StickyNote
          className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
        />
        <p className="line-clamp-2 text-[11px] leading-relaxed text-foreground0">
          {sonNot}
        </p>
      </footer>
    </article>
  );
}
