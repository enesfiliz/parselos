"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";

import { DealKanbanCard } from "@/components/features/deals/kanban/DealKanbanCard";
import type { DealCardData, DealStageId } from "@/lib/types/deal";

export type DraggableDealKanbanCardProps = {
  deal: DealCardData;
  onOpen: () => void;
  onDelete: () => void;
  onStageChange?: (stage: DealStageId) => void;
  enableDrag: boolean;
};

export function DraggableDealKanbanCard({
  deal,
  onOpen,
  onDelete,
  onStageChange,
  enableDrag,
}: DraggableDealKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: deal.id,
      data: { stage: deal.stage },
      disabled: !enableDrag,
    });

  const style: CSSProperties = enableDrag
    ? {
        opacity: isDragging ? 0.12 : 1,
        transform: isDragging ? undefined : CSS.Translate.toString(transform),
        pointerEvents: isDragging ? "none" : undefined,
      }
    : {};

  if (!enableDrag) {
    return (
      <DealKanbanCard
        deal={deal}
        onOpen={onOpen}
        onDelete={onDelete}
        onStageChange={onStageChange}
        showStageSelect
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <DealKanbanCard
        deal={deal}
        onOpen={onOpen}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  );
}
