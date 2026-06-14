"use client";

import { useDroppable } from "@dnd-kit/core";

import { DraggableDealKanbanCard } from "@/components/features/deals/kanban/DraggableDealKanbanCard";
import {
  formatCompactTRY,
  resolveDealBudgetTL,
  type DealCardData,
  type DealStageId,
} from "@/lib/types/deal";
import { cn } from "@/lib/utils";

export type DealKanbanColumnProps = {
  stageId: DealStageId;
  label: string;
  deals: DealCardData[];
  onOpenDeal: (deal: DealCardData) => void;
  onDeleteDeal: (dealId: string) => void;
  onStageChange: (dealId: string, stage: DealStageId) => void;
  enableDrag: boolean;
};

export function DealKanbanColumn({
  stageId,
  label,
  deals,
  onOpenDeal,
  onDeleteDeal,
  onStageChange,
  enableDrag,
}: DealKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stageId,
    disabled: !enableDrag,
  });
  const vol = deals.reduce((s, d) => s + resolveDealBudgetTL(d), 0);

  return (
    <div className="flex w-[min(82vw,280px)] shrink-0 snap-start flex-col md:w-[min(100%,292px)]">
      <div className="mb-3 px-1">
        <h2 className="text-sm font-semibold text-foreground">{label}</h2>
        <p className="mt-0.5 text-[11px] font-medium text-muted-foreground md:text-[10px]">
          {deals.length} Aktif · {formatCompactTRY(vol)}
        </p>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[120px] flex-1 rounded-2xl border border-border/50 bg-parsel-sunken p-2.5 transition-colors md:min-h-[520px]",
          isOver && "border-border bg-parsel-sunken",
        )}
      >
        <div className="flex flex-col gap-3">
          {deals.length === 0 ? (
            <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
              Bu aşamada fırsat yok
            </p>
          ) : (
            deals.map((deal) => (
              <DraggableDealKanbanCard
                key={deal.id}
                deal={deal}
                enableDrag={enableDrag}
                onOpen={() => onOpenDeal(deal)}
                onDelete={() => onDeleteDeal(deal.id)}
                onStageChange={(stage) => onStageChange(deal.id, stage)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
