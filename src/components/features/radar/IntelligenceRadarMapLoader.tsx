"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import {
  defaultIntelligenceRadarConfig,
  loadIntelligenceRadarConfig,
  saveIntelligenceRadarConfig,
  toggleLayerInConfig,
  type IntelligenceRadarConfig,
  POPULAR_RADAR_REGIONS,
} from "@/lib/radar/intelligence-radar-config";
import type { IntelligenceLayerId } from "@/lib/radar/wms-services";

const IntelligenceRadarMap = dynamic(
  () =>
    import("@/components/features/radar/IntelligenceRadarMap").then(
      (mod) => mod.IntelligenceRadarMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[80vh] items-center justify-center rounded-3xl border border-border/60 bg-background">
        <p className="text-sm text-muted-foreground">İstihbarat haritası yükleniyor…</p>
      </div>
    ),
  },
);

export function IntelligenceRadarMapLoader() {
  const [config, setConfig] = useState<IntelligenceRadarConfig>(
    defaultIntelligenceRadarConfig,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setConfig(loadIntelligenceRadarConfig());
      setHydrated(true);
    });
  }, []);

  const persist = useCallback((next: IntelligenceRadarConfig) => {
    setConfig(next);
    saveIntelligenceRadarConfig(next);
  }, []);

  const onToggleLayer = useCallback((id: IntelligenceLayerId) => {
    setConfig((current) => {
      const next = toggleLayerInConfig(current, id);
      saveIntelligenceRadarConfig(next);
      return next;
    });
  }, []);

  const onViewChange = useCallback((view: IntelligenceRadarConfig["view"]) => {
    setConfig((current) => {
      const next = { ...current, view };
      saveIntelligenceRadarConfig(next);
      return next;
    });
  }, []);

  const onSelectRegion = useCallback(
    (region: (typeof POPULAR_RADAR_REGIONS)[number]) => {
      setConfig((current) => {
        const next = {
          ...current,
          view: {
            longitude: region.lng,
            latitude: region.lat,
            zoom: region.zoom,
            label: region.label,
          },
        };
        saveIntelligenceRadarConfig(next);
        return next;
      });
    },
    [],
  );

  const onReset = useCallback(() => {
    persist(defaultIntelligenceRadarConfig());
  }, [persist]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center rounded-3xl border border-border/60 bg-background">
        <p className="text-sm text-muted-foreground">Harita ayarları yükleniyor…</p>
      </div>
    );
  }

  return (
    <IntelligenceRadarMap
      activeLayers={config.layers}
      onToggleLayer={onToggleLayer}
      initialView={config.view}
      onViewChange={onViewChange}
      radarConfig={config}
      onSelectRegion={onSelectRegion}
      onResetConfig={onReset}
    />
  );
}
