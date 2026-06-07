export type WmsServiceId = "amd" | "abi";

export type IntelligenceLayerId =
  | "fay-hatlari"
  | "sit-alani-sinirlari"
  | "konut-imar"
  | "ticari-imar"
  | "tarim-alanlari";

export type IntelligenceLayerConfig = {
  id: IntelligenceLayerId;
  label: string;
  service: WmsServiceId;
  layers: string;
  opacity: number;
  attribution: string;
};

/** TUCBS / MTA — doğrulanmış WMS katmanları (Spatineo + GetMap test) */
export const INTELLIGENCE_WMS_LAYERS: IntelligenceLayerConfig[] = [
  {
    id: "fay-hatlari",
    label: "Fay Hatları (MTA)",
    service: "abi",
    layers: "71",
    opacity: 0.92,
    attribution: "MTA · TUCBS ABI WMS",
  },
  {
    id: "sit-alani-sinirlari",
    label: "Sit Alanı Sınırları",
    service: "amd",
    layers: "38",
    opacity: 0.78,
    attribution: "TUCBS AMD WMS",
  },
  {
    id: "konut-imar",
    label: "Konut İmar Alanları",
    service: "amd",
    layers: "14",
    opacity: 0.72,
    attribution: "TUCBS AMD WMS",
  },
  {
    id: "ticari-imar",
    label: "Ticari / Sanayi Alanları",
    service: "amd",
    layers: "15",
    opacity: 0.72,
    attribution: "TUCBS AMD WMS",
  },
  {
    id: "tarim-alanlari",
    label: "Tarım Alanları",
    service: "amd",
    layers: "1",
    opacity: 0.68,
    attribution: "TUCBS AMD WMS",
  },
];

export const WMS_UPSTREAM_BASE: Record<WmsServiceId, string> = {
  amd: "https://tucbs-public-api.csb.gov.tr/csb_cdp_amd_wms",
  abi: "https://tucbs-public-api.csb.gov.tr/csb_cdp_abi_wms",
};

export const DEFAULT_RADAR_VIEW = {
  longitude: 30.0385,
  latitude: 40.1742,
  zoom: 11,
  label: "Bilecik · Söğüt",
};

export type IntelligenceLayerState = Record<IntelligenceLayerId, boolean>;

export const DEFAULT_INTELLIGENCE_LAYERS: IntelligenceLayerState = {
  "fay-hatlari": true,
  "sit-alani-sinirlari": false,
  "konut-imar": true,
  "ticari-imar": true,
  "tarim-alanlari": false,
};

export function buildWmsTileUrl(
  layer: IntelligenceLayerConfig,
  origin = "",
): string {
  const base = `${origin}/api/wms-proxy`;
  const params = new URLSearchParams({
    service: layer.service,
    layers: layer.layers,
    width: "256",
    height: "256",
  });

  return `${base}?${params.toString()}&bbox={bbox-epsg-3857}`;
}
