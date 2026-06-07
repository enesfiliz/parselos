"use client";

import type { ReactNode } from "react";
import { Radar } from "lucide-react";

import { KOCAELI_ILCELER } from "@/lib/fsbo/fsbo-media";
import {
  EMPTY_FSBO_FILTERS,
  type FsboRadarFilters,
} from "@/lib/types/fsbo-lead";
import { cn } from "@/lib/utils";

const selectClass =
  "h-9 min-w-[120px] rounded-lg border border-white/10 bg-[#09090b] px-2.5 text-xs text-zinc-100 outline-none focus:border-[#b38c56]/40";

const inputClass =
  "h-9 w-full min-w-[100px] rounded-lg border border-white/10 bg-[#09090b] px-2.5 text-xs text-zinc-100 outline-none focus:border-[#b38c56]/40";

type FsboFilterBarProps = {
  draft: FsboRadarFilters;
  onDraftChange: (filters: FsboRadarFilters) => void;
  onRun: () => void;
  isRunning?: boolean;
};

export function FsboFilterBar({
  draft,
  onDraftChange,
  onRun,
  isRunning = false,
}: FsboFilterBarProps) {
  function patch(partial: Partial<FsboRadarFilters>) {
    onDraftChange({ ...draft, ...partial });
  }

  return (
    <section className="rounded-2xl border border-white/5 bg-[#151f23] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Radar className="size-4 text-[#b38c56]" strokeWidth={1.5} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          İstihbarat Filtreleri
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
            className="h-9 rounded-lg border border-white/10 px-3 text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
          >
            Sıfırla
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={onRun}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#b38c56] px-5 text-xs font-bold text-black transition-colors hover:bg-[#c9a06a] disabled:opacity-60"
          >
            <Radar className={cn("size-4", isRunning && "animate-spin")} />
            Radarı Çalıştır
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
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </span>
      {children}
    </label>
  );
}
