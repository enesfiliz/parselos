"use client";

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import { toast } from "sonner";

import { saveDealCard, updateDealStage } from "@/app/actions/deals";
import { DealCard } from "@/app/(dashboard)/deals/components/DealCard";
import { DealDetailSheet } from "@/app/(dashboard)/deals/components/DealDetailSheet";
import {
  isMockDealId,
  loadPersistedMockDeals,
  persistMockDeals,
} from "@/lib/deals/deal-persistence";
import {
  DEAL_STAGES,
  applyOptimisticDealMove,
  formatCompactTRY,
  sumDealsBudget,
  type DealCardData,
  type DealStageId,
} from "@/lib/types/deal";
import { cn } from "@/lib/utils";
import type { DealStage } from "@prisma/client";

const SAVE_DEBOUNCE_MS = 500;
const STAGE_ID_SET = new Set<DealStageId>(DEAL_STAGES.map((stage) => stage.id));

const kanbanCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return rectIntersection(args);
};

function DraggableDealCard({
  deal,
  onOpen,
}: {
  deal: DealCardData;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: deal.id,
      data: { stage: deal.stage },
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0 : 1,
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    pointerEvents: isDragging ? "none" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (!isDragging) onOpen();
      }}
    >
      <DealCard deal={deal} isDragging={isDragging} />
    </div>
  );
}

function KanbanColumn({
  stageId,
  label,
  description,
  deals,
  onOpenDeal,
}: {
  stageId: DealStageId;
  label: string;
  description: string;
  deals: DealCardData[];
  onOpenDeal: (deal: DealCardData) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId });
  const columnVolume = sumDealsBudget(deals);

  return (
    <div className="flex w-[min(82vw,280px)] shrink-0 snap-start flex-col md:w-[min(100%,292px)]">
      <div className="mb-3 px-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">{label}</h2>
          <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full border border-border bg-parsel-panel px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
            {deals.length}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground md:text-[10px]">{description}</p>
          <p className="text-[11px] font-medium text-muted-foreground md:text-[10px]">
            {formatCompactTRY(columnVolume)}
          </p>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "min-h-[280px] flex-1 rounded-2xl border border-border/50 bg-parsel-sunken p-2.5 md:min-h-[520px]",
          isOver && "border-[#b38c56]/30 bg-parsel-sunken",
        )}
      >
        <div className="flex flex-col gap-3">
          {deals.map((deal) => (
            <DraggableDealCard
              key={deal.id}
              deal={deal}
              onOpen={() => onOpenDeal(deal)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DealsKanbanBoard({
  initialDeals,
  useMock = false,
  onDealsChange,
}: {
  initialDeals: DealCardData[];
  useMock?: boolean;
  onDealsChange?: (deals: DealCardData[]) => void;
}) {
  const [deals, setDeals] = useState(initialDeals);
  const [activeDealId, setActiveDealId] = useState<string | null>(null);
  const [isDraggingBoard, setIsDraggingBoard] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<DealCardData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [, startTransition] = useTransition();
  const saveTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const dealsRef = useRef(deals);

  useEffect(() => {
    dealsRef.current = deals;
  }, [deals]);

  useEffect(() => {
    queueMicrotask(() => {
      setDeals(useMock ? loadPersistedMockDeals(initialDeals) : initialDeals);
    });
  }, [initialDeals, useMock]);

  useEffect(() => {
    if (!useMock) return;

    function handleMockDealsUpdated() {
      setDeals(loadPersistedMockDeals(initialDeals));
    }

    window.addEventListener("parselos:mock-deals-updated", handleMockDealsUpdated);
    return () => {
      window.removeEventListener(
        "parselos:mock-deals-updated",
        handleMockDealsUpdated,
      );
    };
  }, [initialDeals, useMock]);

  const commitDeals = useCallback(
    (next: DealCardData[]) => {
      dealsRef.current = next;
      setDeals(next);
      onDealsChange?.(next);
      if (useMock) {
        persistMockDeals(next);
      }
    },
    [onDealsChange, useMock],
  );

  const scheduleServerSave = useCallback((deal: DealCardData) => {
    if (isMockDealId(deal.id)) return;

    const timers = saveTimersRef.current;
    const existing = timers.get(deal.id);
    if (existing) clearTimeout(existing);

    timers.set(
      deal.id,
      setTimeout(() => {
        timers.delete(deal.id);
        startTransition(async () => {
          const response = await saveDealCard(deal);
          if (!response.success) {
            toast.error(response.error);
            return;
          }

          commitDeals(
            dealsRef.current.map((item) =>
              item.id === response.data.id ? response.data : item,
            ),
          );
          setSelectedDeal((current) =>
            current?.id === response.data.id ? response.data : current,
          );
        });
      }, SAVE_DEBOUNCE_MS),
    );
  }, [commitDeals]);

  useEffect(() => {
    const timers = saveTimersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const dealsByStage = useMemo(() => {
    const map = Object.fromEntries(
      DEAL_STAGES.map((stage) => [stage.id, [] as DealCardData[]]),
    ) as Record<DealStageId, DealCardData[]>;

    for (const deal of deals) {
      map[deal.stage].push(deal);
    }

    return map;
  }, [deals]);

  const activeDeal = activeDealId
    ? deals.find((deal) => deal.id === activeDealId)
    : null;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    }),
  );

  function clearDragState() {
    setIsDraggingBoard(false);
    setActiveDealId(null);
  }

  function handleDragStart(event: DragStartEvent) {
    setIsDraggingBoard(true);
    setActiveDealId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    clearDragState();

    const dealId = String(event.active.id);
    const overId = event.over?.id;
    if (!overId) return;

    const nextStage = String(overId) as DealStage;
    if (!STAGE_ID_SET.has(nextStage)) return;

    const currentDeal = dealsRef.current.find((deal) => deal.id === dealId);
    if (!currentDeal || currentDeal.stage === nextStage) return;

    const previousStage = currentDeal.stage;
    const nextDeals = applyOptimisticDealMove(dealsRef.current, {
      dealId,
      stage: nextStage,
    });
    commitDeals(nextDeals);

    if (useMock || isMockDealId(dealId)) {
      return;
    }

    void (async () => {
      const response = await updateDealStage(dealId, nextStage);
      if (!response.success) {
        toast.error(response.error);
        commitDeals(
          applyOptimisticDealMove(dealsRef.current, {
            dealId,
            stage: previousStage,
          }),
        );
        return;
      }

      commitDeals(
        dealsRef.current.map((deal) =>
          deal.id === response.data.id ? response.data : deal,
        ),
      );
    })();
  }

  function handleDragCancel() {
    clearDragState();
  }

  function handleDealChange(updated: DealCardData) {
    const nextDeals = dealsRef.current.map((deal) =>
      deal.id === updated.id ? updated : deal,
    );
    commitDeals(nextDeals);
    setSelectedDeal(updated);
    scheduleServerSave(updated);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={kanbanCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className={cn(
          "-mx-3 flex gap-4 overflow-x-auto overscroll-x-contain px-3 pb-3 touch-pan-x md:mx-0 md:px-0 md:pb-2",
          !isDraggingBoard && "snap-x snap-mandatory",
        )}
      >
        {DEAL_STAGES.map((column) => (
          <KanbanColumn
            key={column.id}
            stageId={column.id}
            label={column.label}
            description={column.description}
            deals={dealsByStage[column.id]}
            onOpenDeal={(deal) => {
              setSelectedDeal(deal);
              setDetailOpen(true);
            }}
          />
        ))}
      </div>

      <DealDetailSheet
        deal={selectedDeal}
        open={detailOpen}
        useMock={useMock}
        onOpenChange={setDetailOpen}
        onDealChange={handleDealChange}
      />

      <DragOverlay dropAnimation={{ duration: 140, easing: "cubic-bezier(0.18, 0.67, 0.6, 1)" }}>
        {activeDeal ? (
          <div className="w-[280px] cursor-grabbing">
            <DealCard deal={activeDeal} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
