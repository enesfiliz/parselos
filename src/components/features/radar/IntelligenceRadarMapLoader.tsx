"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import {
  DEFAULT_INTELLIGENCE_LAYERS,
  type IntelligenceLayerId,
  type IntelligenceLayerState,
} from "@/lib/radar/wms-services";

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
  const [activeLayers, setActiveLayers] = useState<IntelligenceLayerState>(
    DEFAULT_INTELLIGENCE_LAYERS,
  );

  const onToggleLayer = useCallback((id: IntelligenceLayerId) => {
    setActiveLayers((current) => ({ ...current, [id]: !current[id] }));
  }, []);

  return (
    <IntelligenceRadarMap
      activeLayers={activeLayers}
      onToggleLayer={onToggleLayer}
    />
  );
}
