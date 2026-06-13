"use client";

import { memo } from "react";
import { Home, MapPin, MessageCircle, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DealAppointmentWhisper } from "@/components/features/deals/DealAppointmentWhisper";
import { DealIntelligenceNote } from "@/components/features/deals/DealIntelligenceNote";
import { resolvePropertyType } from "@/lib/deals/deal-display-helpers";
import { resolveDealLocation } from "@/lib/deals/match-fsbo";
import { buildTemplateWhatsAppUrl } from "@/lib/deals/whatsapp-templates";
import { getInitials } from "@/lib/client-birthday";
import {
  DEAL_STAGES,
  formatFullTRY,
  resolveDealBudgetTL,
  taskProgress,
  type DealCardData,
  type DealStageId,
} from "@/lib/types/deal";
import { cn } from "@/lib/utils";

export type DealKanbanCardProps = {
  deal: DealCardData;
  onOpen: () => void;
  onDelete: () => void;
  onStageChange?: (stage: DealStageId) => void;
  showStageSelect?: boolean;
  isDragging?: boolean;
};

export const DealKanbanCard = memo(function DealKanbanCard({
  deal,
  onOpen,
  onDelete,
  onStageChange,
  showStageSelect,
  isDragging,
}: DealKanbanCardProps) {
  const name = deal.client.adSoyad;
  const budget = formatFullTRY(resolveDealBudgetTL(deal));
  const location = resolveDealLocation(deal);
  const propertyType = resolvePropertyType(deal);
  const progress = taskProgress(deal);
  const waHref = buildTemplateWhatsAppUrl(deal, "post-showing");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!isDragging) onOpen();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isDragging) onOpen();
        }
      }}
      className={cn(
        "group relative flex min-h-[224px] w-full min-w-0 flex-col gap-3.5 rounded-2xl border border-border/50 bg-parsel-panel p-4 text-left shadow-sm contain-layout hover:border-border hover:shadow-xl",
        !showStageSelect && "cursor-grab active:cursor-grabbing",
        isDragging && "shadow-2xl ring-1 ring-[#b38c56]/35 will-change-transform",
      )}
    >
      {deal.etiket ? (
        <span className="inline-flex w-fit truncate rounded-md border border-border/50 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground md:text-[10px]">
          {deal.etiket}
        </span>
      ) : null}

      <div className="flex w-full items-center justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[11px] font-semibold leading-none text-foreground/70 md:text-[9px]"
            aria-hidden
          >
            {getInitials(name)}
          </span>
          <h3 className="min-w-0 truncate text-sm font-medium tracking-tight text-foreground/90">
            {name}
          </h3>
        </div>
        <button
          type="button"
          title="Fırsatı sil"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100"
        >
          <Trash2
            className="h-4 w-4 text-muted-foreground transition-colors hover:text-red-400"
            strokeWidth={1.75}
          />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <p className="m-0 truncate text-lg font-semibold tracking-tight text-parsel-gold">
          {budget}
        </p>
        <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
          <Home className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          <span className="min-w-0 truncate">{propertyType}</span>
          <span className="shrink-0 text-muted-foreground">•</span>
          <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          <span className="min-w-0 flex-1 truncate">{location}</span>
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col">
        <div className="my-0.5 h-px w-full bg-foreground/5" />

        <DealIntelligenceNote
          deal={deal}
          className="mt-0 w-full min-w-0 border-t-0 pt-0"
        />

        <DealAppointmentWhisper dealId={deal.id} />

        <div className="mt-1 flex w-full items-center justify-between gap-2">
          {progress ? (
            <p className="flex min-w-0 items-center gap-1.5 truncate text-xs font-medium text-muted-foreground">
              <StickyNote className="h-3 w-3 shrink-0" strokeWidth={1.75} />
              <span className="truncate">
                {progress.done}/{progress.total} Görev
              </span>
            </p>
          ) : (
            <span className="flex-1" aria-hidden />
          )}
          <a
            href={waHref ?? "#"}
            target="_blank"
            rel="noreferrer"
            title="WhatsApp ile hızlı mesaj"
            onClick={(e) => {
              e.stopPropagation();
              if (!waHref) {
                e.preventDefault();
                toast.error("Müşteri telefonu kayıtlı değil.");
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-foreground shadow-sm transition-colors hover:bg-[#20ba5a]",
              !waHref && "cursor-not-allowed opacity-40",
            )}
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
          </a>
        </div>
      </div>

      {showStageSelect && onStageChange ? (
        <div
          className="md:hidden"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:text-[10px]">
            Aşama Değiştir
          </label>
          <select
            value={deal.stage}
            onChange={(e) =>
              onStageChange(e.target.value as DealStageId)
            }
            className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-[#b38c56]/40"
          >
            {DEAL_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
});
