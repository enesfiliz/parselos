"use client";

import type { ReactNode } from "react";
import { ListFilter } from "lucide-react";

import { KOCAELI_ILCELER } from "@/lib/fsbo/fsbo-media";
import {
  EMPTY_FSBO_FILTERS,
  type FsboRadarFilters,
} from "@/lib/types/fsbo-lead";
import { cn } from "@/lib/utils";

const selectClass =
  "h-9 min-w-[120px] rounded-lg border border-border/60 bg-parsel-elevated px-2.5 text-xs text-foreground outline-none focus:border-primary/30";

const inputClass =
  "h-9 w-full min-w-[100px] rounded-lg border border-border/60 bg-parsel-elevated px-2.5 text-xs text-foreground outline-none focus:border-primary/30";

type FsboFilterBarProps = {
  draft: FsboRadarFilters;
  onDraftChange: (filters: FsboRadarFilters) => void;
  onApply: () => void;
  isRunning?: boolean;
};

export function FsboFilterBar({
  draft,
  onDraftChange,
  onApply,
  isRunning = false,
}: FsboFilterBarProps) {
  function patch(partial: Partial<FsboRadarFilters>) {
    onDraftChange({ ...draft, ...partial });
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm">
      <div className="mb-3 flex items-center gap-2">
        <ListFilter className="size-4 text-primary" strokeWidth={1.5} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Liste filtreleri
        </p>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <FilterField label="İşlem Tipi">
            <select
              value={draft.islemTipi}
              onChange={(e) =>
                patch({
                  islemTipi: e.target.value as FsboRadarFilters["islemTipi"],
                })
              }
              className={cn(selectClass, "w-full")}
            >
              <option value="">Tümü</option>
              <option value="SATILIK">Satılık</option>
              <option value="KIRALIK">Kiralık</option>
            </select>
          </FilterField>

          <FilterField label="Kategori">
            <select
              value={draft.kategori}
              onChange={(e) =>
                patch({
                  kategori: e.target.value as FsboRadarFilters["kategori"],
                })
              }
              className={cn(selectClass, "w-full")}
            >
              <option value="">Tümü</option>
              <option value="KONUT">Konut</option>
              <option value="ARSA">Arsa</option>
              <option value="TICARI">Ticari</option>
            </select>
          </FilterField>

          <FilterField label="İl">
            <select
              value={draft.il}
              onChange={(e) => patch({ il: e.target.value, ilce: "" })}
              className={cn(selectClass, "w-full")}
            >
              <option value="">Tüm İller</option>
              <option value="Kocaeli">Kocaeli</option>
            </select>
          </FilterField>

          <FilterField label="İlçe">
            <select
              value={draft.ilce}
              onChange={(e) => patch({ ilce: e.target.value, il: "Kocaeli" })}
              className={cn(selectClass, "w-full")}
            >
              <option value="">Tüm İlçeler</option>
              {KOCAELI_ILCELER.map((ilce) => (
                <option key={ilce} value={ilce}>
                  {ilce}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Min Fiyat">
            <input
              type="text"
              inputMode="numeric"
              value={draft.priceMin}
              onChange={(e) => patch({ priceMin: e.target.value })}
              placeholder="₺ Min"
              className={inputClass}
            />
          </FilterField>

          <FilterField label="Max Fiyat">
            <input
              type="text"
              inputMode="numeric"
              value={draft.priceMax}
              onChange={(e) => patch({ priceMax: e.target.value })}
              placeholder="₺ Max"
              className={inputClass}
            />
          </FilterField>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onDraftChange(EMPTY_FSBO_FILTERS)}
            className="h-9 rounded-lg border border-border/60 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Sıfırla
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={onApply}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <ListFilter className={cn("size-4", isRunning && "animate-pulse")} />
            Filtrele
          </button>
        </div>
      </div>
    </section>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
