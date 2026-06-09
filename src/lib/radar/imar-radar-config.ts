export const IMAR_RADAR_STORAGE_KEY = "parselos-imar-radar-config";

export const DEFAULT_IMAR_REGION = "Bilecik Söğüt";

export const IMAR_KEYWORD_OPTIONS = [
  { id: "sanayi", label: "sanayi" },
  { id: "imar-plani", label: "imar planı" },
  { id: "parsel", label: "parsel" },
  { id: "aski", label: "askı" },
  { id: "plan-degisikligi", label: "plan değişikliği" },
  { id: "nazim-imar", label: "nazım imar" },
] as const;

export const DEFAULT_IMAR_KEYWORDS = ["sanayi", "imar planı", "parsel", "askı"];

export const POPULAR_IMAR_REGIONS = [
  { label: "Bilecik Söğüt", query: "Söğüt, Bilecik" },
  { label: "Kadıköy, İstanbul", query: "Kadıköy, İstanbul" },
  { label: "Çankaya, Ankara", query: "Çankaya, Ankara" },
  { label: "Bornova, İzmir", query: "Bornova, İzmir" },
] as const;

export type ImarRadarConfig = {
  region: string;
  keywords: string[];
};

export function formatRegionLabel(region: string) {
  const parts = region
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]}, ${parts[1]}`;
  }

  const single = parts[0] ?? region;
  const words = single.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const district = words[words.length - 1];
    const city = words.slice(0, -1).join(" ");
    return `${district}, ${city}`;
  }

  return single;
}

/** İlçe + il ayrıştırması (scraper için) */
export function parseRegionParts(region: string) {
  const label = formatRegionLabel(region);
  const parts = label.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { district: parts[0], city: parts[1], label };
  }
  const single = parts[0] ?? region;
  return { district: single, city: single, label: single };
}

export function loadImarRadarConfig(): ImarRadarConfig {
  if (typeof window === "undefined") {
    return { region: DEFAULT_IMAR_REGION, keywords: [...DEFAULT_IMAR_KEYWORDS] };
  }

  try {
    const raw = localStorage.getItem(IMAR_RADAR_STORAGE_KEY);
    if (!raw) {
      return { region: DEFAULT_IMAR_REGION, keywords: [...DEFAULT_IMAR_KEYWORDS] };
    }

    const parsed = JSON.parse(raw) as Partial<ImarRadarConfig>;
    return {
      region: parsed.region?.trim() || DEFAULT_IMAR_REGION,
      keywords:
        Array.isArray(parsed.keywords) && parsed.keywords.length > 0
          ? parsed.keywords
          : [...DEFAULT_IMAR_KEYWORDS],
    };
  } catch {
    return { region: DEFAULT_IMAR_REGION, keywords: [...DEFAULT_IMAR_KEYWORDS] };
  }
}

export function saveImarRadarConfig(config: ImarRadarConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(IMAR_RADAR_STORAGE_KEY, JSON.stringify(config));
}
