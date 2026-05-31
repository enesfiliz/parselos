const TKGM_API_BASE = "https://cbsapi.tkgm.gov.tr/megsiswebapi.v3.1/api";

const FETCH_HEADERS: HeadersInit = {
  Accept: "application/json",
  "User-Agent": "Parselos/1.0 (Ekspertiz Modulu)",
};

interface IdariFeature {
  type: string;
  properties?: {
    text?: string;
    id?: number;
  };
}

interface IdariFeatureCollection {
  type: string;
  features?: IdariFeature[];
}

interface ParselGeoJson {
  type: string;
  geometry?: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  properties?: {
    alan?: string;
    mahalleId?: number;
    adaNo?: string;
    parselNo?: string;
    nitelik?: string;
  };
}

export interface TkgmQueryInput {
  il: string;
  ilce: string;
  mahalle: string;
  ada: string;
  parsel: string;
}

export interface TkgmQueryResult {
  m2: number;
  koordinatlar: [number, number];
  nitelik?: string;
}

function normalizeForMatch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

function namesMatch(input: string, candidate: string): boolean {
  const normalizedInput = normalizeForMatch(input);
  const normalizedCandidate = normalizeForMatch(candidate);

  if (!normalizedInput || !normalizedCandidate) return false;

  return (
    normalizedInput === normalizedCandidate ||
    normalizedCandidate.includes(normalizedInput) ||
    normalizedInput.includes(normalizedCandidate)
  );
}

async function fetchTkgmJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) return null;

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function findIdByName(
  collection: IdariFeatureCollection | null,
  name: string,
): number | null {
  if (!collection?.features?.length) return null;

  const exact = collection.features.find(
    (feature) =>
      feature.properties?.text &&
      namesMatch(name, feature.properties.text),
  );

  if (exact?.properties?.id) return exact.properties.id;

  return null;
}

export function parseTkgmAlan(alan: string): number {
  const cleaned = alan.trim().replace(/\s/g, "");

  if (!cleaned) return 0;

  if (/,\d{1,2}$/.test(cleaned) && cleaned.includes(".")) {
    return Number.parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }

  if (cleaned.includes(",") && !cleaned.includes(".")) {
    return Number.parseFloat(cleaned.replace(",", "."));
  }

  return Number.parseFloat(cleaned.replace(/,/g, "")) || 0;
}

function ringCentroid(ring: number[][]): [number, number] {
  const points =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring;

  if (points.length === 0) return [0, 0];

  let sumLon = 0;
  let sumLat = 0;

  for (const [lon, lat] of points) {
    sumLon += lon;
    sumLat += lat;
  }

  const count = points.length;
  return [sumLat / count, sumLon / count];
}

function extractCentroid(geometry: ParselGeoJson["geometry"]): [number, number] | null {
  if (!geometry?.coordinates) return null;

  if (geometry.type === "Polygon") {
    const ring = (geometry.coordinates as number[][][])[0];
    return ring ? ringCentroid(ring) : null;
  }

  if (geometry.type === "MultiPolygon") {
    const firstPolygon = (geometry.coordinates as number[][][][])[0];
    const ring = firstPolygon?.[0];
    return ring ? ringCentroid(ring) : null;
  }

  return null;
}

export async function queryTkgmParsel(
  input: TkgmQueryInput,
): Promise<TkgmQueryResult | null> {
  const il = input.il.trim();
  const ilce = input.ilce.trim();
  const mahalle = input.mahalle.trim();
  const ada = input.ada.trim();
  const parsel = input.parsel.trim();

  if (!il || !ilce || !mahalle || !ada || !parsel) {
    return null;
  }

  const ilListe = await fetchTkgmJson<IdariFeatureCollection>(
    `${TKGM_API_BASE}/idariYapi/ilListe`,
  );
  const ilId = findIdByName(ilListe, il);
  if (!ilId) return null;

  const ilceListe = await fetchTkgmJson<IdariFeatureCollection>(
    `${TKGM_API_BASE}/idariYapi/ilceListe/${ilId}`,
  );
  const ilceId = findIdByName(ilceListe, ilce);
  if (!ilceId) return null;

  const mahalleListe = await fetchTkgmJson<IdariFeatureCollection>(
    `${TKGM_API_BASE}/idariYapi/mahalleListe/${ilceId}`,
  );
  const mahalleId = findIdByName(mahalleListe, mahalle);
  if (!mahalleId) return null;

  const parselData = await fetchTkgmJson<ParselGeoJson>(
    `${TKGM_API_BASE}/parsel/${mahalleId}/${ada}/${parsel}`,
  );

  if (!parselData?.properties?.alan || !parselData.geometry) {
    return null;
  }

  const m2 = parseTkgmAlan(String(parselData.properties.alan));
  const centroid = extractCentroid(parselData.geometry);

  if (!m2 || !centroid) return null;

  return {
    m2,
    koordinatlar: centroid,
    nitelik: parselData.properties.nitelik
      ? String(parselData.properties.nitelik)
      : undefined,
  };
}

export function formatTkgmAlan(m2: number): string {
  if (Number.isInteger(m2)) return String(m2);
  return m2.toFixed(2).replace(/\.?0+$/, "") || m2.toFixed(2);
}
