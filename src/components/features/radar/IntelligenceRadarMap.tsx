"use client";

import { Layers } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import Map, { Layer, NavigationControl, Source } from "react-map-gl/mapbox";

import { RadarGeocodeSearch } from "@/components/features/radar/RadarGeocodeSearch";
import { RadarMapLegend } from "@/components/features/radar/RadarMapLegend";
import {
  DEFAULT_RADAR_VIEW,
  INTELLIGENCE_WMS_LAYERS,
  buildWmsTileUrl,
  type IntelligenceLayerId,
  type IntelligenceLayerState,
} from "@/lib/radar/wms-services";
import {
  INTELLIGENCE_LAYER_TOGGLES,
  type IntelligenceLayerToggle,
} from "@/lib/radar/intelligence-radar-layers";
import { cn } from "@/lib/utils";

import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v11";

export type IntelligenceRadarMapProps = {
  activeLayers: IntelligenceLayerState;
  onToggleLayer: (id: IntelligenceLayerId) => void;
};

function LayerSwitch({
  layer,
  enabled,
  onToggle,
}: {
  layer: IntelligenceLayerToggle;
  enabled: boolean;
  onToggle: () => void;
}) {
  const Icon = layer.icon;

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.04] bg-white/[0.015] px-2.5 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors",
            enabled
              ? "border-[#b38c56]/30 bg-[#b38c56]/12 text-[#b38c56]"
              : "border-zinc-800/80 bg-zinc-900/50 text-zinc-500",
          )}
        >
          <Icon className="size-3" strokeWidth={1.5} />
        </span>
        <span
          className={cn(
            "truncate text-xs font-medium",
            enabled ? "text-zinc-200" : "text-zinc-500",
          )}
        >
          {layer.label}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${layer.label} katmanı`}
        onClick={onToggle}
        className={cn(
          "relative h-4 w-7 shrink-0 rounded-full transition-colors duration-300",
          enabled ? "bg-[#b38c56]/90" : "bg-zinc-700/80",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-3 rounded-full bg-white shadow-sm transition-transform duration-300",
            enabled && "translate-x-3",
          )}
        />
      </button>
    </div>
  );
}

function LayerControlPanel({
  activeLayers,
  onToggleLayer,
}: IntelligenceRadarMapProps) {
  return (
    <aside className="pointer-events-auto absolute top-6 left-6 z-10 w-64 max-w-[calc(100%-3rem)]">
      <div className="rounded-xl border border-white/[0.08] bg-[#151F23]/70 p-3.5 shadow-xl backdrop-blur-xl">
        <div className="mb-2.5 flex items-center gap-2 border-b border-white/[0.05] pb-2">
          <span className="flex size-6 items-center justify-center rounded-md border border-[#b38c56]/20 bg-[#b38c56]/8 text-[#b38c56]">
            <Layers className="size-3" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-600">
              TUCBS / MTA
            </p>
            <h2 className="text-xs font-semibold text-zinc-300">Canlı WMS Katmanları</h2>
          </div>
        </div>

        <div className="space-y-1.5">
          {INTELLIGENCE_LAYER_TOGGLES.map((layer) => (
            <LayerSwitch
              key={layer.id}
              layer={layer}
              enabled={activeLayers[layer.id]}
              onToggle={() => onToggleLayer(layer.id)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

function WmsRasterLayers({
  activeLayers,
  origin,
}: {
  activeLayers: IntelligenceLayerState;
  origin: string;
}) {
  const visibleLayers = useMemo(
    () => INTELLIGENCE_WMS_LAYERS.filter((layer) => activeLayers[layer.id]),
    [activeLayers],
  );

  return (
    <>
      {visibleLayers.map((layer) => (
        <Source
          key={layer.id}
          id={`wms-${layer.id}`}
          type="raster"
          tiles={[buildWmsTileUrl(layer, origin)]}
          tileSize={256}
        >
          <Layer
            id={`wms-layer-${layer.id}`}
            type="raster"
            paint={{
              "raster-opacity": layer.opacity,
              "raster-fade-duration": 120,
            }}
          />
        </Source>
      ))}
    </>
  );
}

export function IntelligenceRadarMap({
  activeLayers,
  onToggleLayer,
}: IntelligenceRadarMapProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_RADAR_VIEW.longitude,
    latitude: DEFAULT_RADAR_VIEW.latitude,
    zoom: DEFAULT_RADAR_VIEW.zoom,
  });

  const origin = "";

  const handleGeocodeSelect = useCallback(
    (result: { lat: number; lng: number; type: string | null }) => {
      const zoom =
        result.type === "city" || result.type === "administrative" ? 9 : 12;

      setViewState({
        longitude: result.lng,
        latitude: result.lat,
        zoom,
      });
    },
    [],
  );

  if (!mapboxToken) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-3 rounded-3xl border border-amber-500/20 bg-[#09090b] px-6 text-center">
        <p className="text-sm font-medium text-zinc-200">
          Mapbox token bulunamadı
        </p>
        <p className="max-w-md text-xs text-zinc-500">
          `.env.local` dosyasına{" "}
          <code className="text-[#b38c56]">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
          ekleyin ve sunucuyu yeniden başlatın.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh] w-full overflow-hidden rounded-3xl border border-white/[0.06] bg-[#09090b]">
      <Map
        mapboxAccessToken={mapboxToken}
        mapStyle={MAPBOX_STYLE}
        {...viewState}
        onMove={(event) => setViewState(event.viewState)}
        style={{ width: "100%", height: "80vh", minHeight: "80vh" }}
        attributionControl
        reuseMaps
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <WmsRasterLayers activeLayers={activeLayers} origin={origin} />
      </Map>

      <div className="pointer-events-none absolute inset-0">
        <LayerControlPanel
          activeLayers={activeLayers}
          onToggleLayer={onToggleLayer}
        />
        <RadarGeocodeSearch onSelect={handleGeocodeSelect} />
        <RadarMapLegend />
      </div>
    </div>
  );
}
