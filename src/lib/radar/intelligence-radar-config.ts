import {
  DEFAULT_INTELLIGENCE_LAYERS,
  DEFAULT_RADAR_VIEW,
  type IntelligenceLayerId,
  type IntelligenceLayerState,
} from "@/lib/radar/wms-services";

export const INTELLIGENCE_RADAR_STORAGE_KEY = "parselos-intelligence-radar-config";

export type IntelligenceRadarConfig = {
  layers: IntelligenceLayerState;
  view: {
    longitude: number;
    latitude: number;
    zoom: number;
    label: string;
  };
};

export const POPULAR_RADAR_REGIONS = [
  { label: "İstanbul", query: "İstanbul, Türkiye", lng: 28.9784, lat: 41.0082, zoom: 9 },
  { label: "Ankara", query: "Ankara, Türkiye", lng: 32.8597, lat: 39.9334, zoom: 9 },
  { label: "İzmir", query: "İzmir, Türkiye", lng: 27.1428, lat: 38.4237, zoom: 9 },
  { label: "Kocaeli", query: "Kocaeli, Türkiye", lng: 29.9167, lat: 40.8533, zoom: 10 },
  { label: "Bilecik · Söğüt", query: "Söğüt, Bilecik", lng: 30.0385, lat: 40.1742, zoom: 11 },
] as const;

export function defaultIntelligenceRadarConfig(): IntelligenceRadarConfig {
  return {
    layers: { ...DEFAULT_INTELLIGENCE_LAYERS },
    view: { ...DEFAULT_RADAR_VIEW },
  };
}

export function loadIntelligenceRadarConfig(): IntelligenceRadarConfig {
  if (typeof window === "undefined") {
    return defaultIntelligenceRadarConfig();
  }

  try {
    const raw = localStorage.getItem(INTELLIGENCE_RADAR_STORAGE_KEY);
    if (!raw) return defaultIntelligenceRadarConfig();

    const parsed = JSON.parse(raw) as Partial<IntelligenceRadarConfig>;
    return {
      layers: { ...DEFAULT_INTELLIGENCE_LAYERS, ...parsed.layers },
      view: {
        ...DEFAULT_RADAR_VIEW,
        ...parsed.view,
      },
    };
  } catch {
    return defaultIntelligenceRadarConfig();
  }
}

export function saveIntelligenceRadarConfig(config: IntelligenceRadarConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(INTELLIGENCE_RADAR_STORAGE_KEY, JSON.stringify(config));
}

export function toggleLayerInConfig(
  config: IntelligenceRadarConfig,
  id: IntelligenceLayerId,
): IntelligenceRadarConfig {
  return {
    ...config,
    layers: { ...config.layers, [id]: !config.layers[id] },
  };
}
