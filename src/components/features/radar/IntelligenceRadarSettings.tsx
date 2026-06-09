"use client";

import { MapPin, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  POPULAR_RADAR_REGIONS,
  type IntelligenceRadarConfig,
} from "@/lib/radar/intelligence-radar-config";
import { cn } from "@/lib/utils";

type IntelligenceRadarSettingsProps = {
  config: IntelligenceRadarConfig;
  onSelectRegion: (region: (typeof POPULAR_RADAR_REGIONS)[number]) => void;
  onReset: () => void;
};

export function IntelligenceRadarSettings({
  config,
  onSelectRegion,
  onReset,
}: IntelligenceRadarSettingsProps) {
  return (
    <aside className="pointer-events-auto absolute top-6 right-6 z-10 w-56 max-w-[calc(100%-3rem)]">
      <div className="rounded-xl border border-border/60 bg-[#151F23]/85 p-3.5 shadow-xl backdrop-blur-xl">
        <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md border border-[#b38c56]/20 bg-parsel-gold/8 text-parsel-gold">
              <MapPin className="size-3" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Harita
              </p>
              <h2 className="text-xs font-semibold text-foreground/90">Bölge & ayarlar</h2>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 text-muted-foreground"
            onClick={onReset}
            title="Varsayılanlara dön"
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>

        <p className="mb-2 text-[10px] font-medium text-muted-foreground">
          Aktif: <span className="text-foreground/90">{config.view.label}</span>
        </p>

        <div className="flex flex-wrap gap-1.5">
          {POPULAR_RADAR_REGIONS.map((region) => {
            const active = config.view.label === region.label;
            return (
              <button
                key={region.label}
                type="button"
                onClick={() => onSelectRegion(region)}
                className={cn(
                  "rounded-md border px-2 py-1 text-[10px] font-semibold transition-colors",
                  active
                    ? "border-parsel-gold/40 bg-parsel-gold/15 text-parsel-gold"
                    : "border-border/50 bg-white/[0.03] text-muted-foreground hover:text-foreground",
                )}
              >
                {region.label}
              </button>
            );
          })}
        </div>

        <p className="mt-2.5 text-[9px] leading-relaxed text-muted-foreground">
          Katman ve konum tercihleri tarayıcıda saklanır.
        </p>
      </div>
    </aside>
  );
}
