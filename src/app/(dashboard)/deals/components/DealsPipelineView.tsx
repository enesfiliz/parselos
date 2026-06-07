"use client";

import { Kanban, Plus, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DealsKanbanBoard } from "@/components/features/deals/DealsKanbanBoard";
import { MOCK_DEALS } from "@/lib/data/mock-deals";
import {
  formatFullTRY,
  sumDealsBudget,
  type DealCardData,
} from "@/lib/types/deal";

type DealsPipelineViewProps = {
  initialDeals?: DealCardData[];
  preferMock?: boolean;
};

export function DealsPipelineView({
  initialDeals = [],
  preferMock = true,
}: DealsPipelineViewProps) {
  const useMock = preferMock || initialDeals.length === 0;

  const pipelineDeals = useMemo(() => {
    if (useMock) return MOCK_DEALS;
    return initialDeals;
  }, [initialDeals, useMock]);

  const [liveDeals, setLiveDeals] = useState<DealCardData[]>(pipelineDeals);

  const totalVolume = sumDealsBudget(liveDeals);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-parsel-gold">
            <Kanban className="size-4" strokeWidth={1.5} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              Enterprise Komuta Merkezi
            </span>
          </div>
          <h1 className="font-outfit text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Fırsat Pipeline
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-light text-foreground0">
            Premium kanban — kartlara tıklayarak kontrol panelini açın, alanları
            anlık düzenleyin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-parsel-sunken px-4 py-2.5">
            <TrendingUp className="size-4 text-parsel-gold" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-foreground0">
                Toplam Hacim
              </p>
              <p className="text-sm font-semibold text-foreground">
                {formatFullTRY(totalVolume)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              toast.info("Yeni fırsat formu yakında — mock pipeline aktif.")
            }
            className="inline-flex items-center gap-2 rounded-xl bg-parsel-gold px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:brightness-110"
          >
            <Plus className="size-4" strokeWidth={2} />
            Yeni Fırsat Ekle
          </button>
        </div>
      </header>

      {useMock ? (
        <p className="text-[11px] text-muted-foreground">
          Önizleme modu: {pipelineDeals.length} mock fırsat yüklendi.
        </p>
      ) : null}

      <DealsKanbanBoard
        initialDeals={pipelineDeals}
        useMock={useMock}
        onDealsChange={setLiveDeals}
      />
    </div>
  );
}
