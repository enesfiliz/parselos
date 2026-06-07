import type { FsboIslemTipi, FsboKategori } from "@/lib/types/fsbo-lead";

export type FsboSyncTarget = {
  region: string;
  il: string;
  ilce: string;
  source: string;
  islemTipi: FsboIslemTipi;
  kategori: FsboKategori;
  searchUrl: string;
};

export const DEFAULT_FSBO_REGIONS = ["Gölcük", "Başiskele"] as const;

export const DEFAULT_FSBO_SYNC_TARGETS: FsboSyncTarget[] = [
  {
    region: "Gölcük",
    il: "Kocaeli",
    ilce: "Gölcük",
    source: "sahibinden",
    islemTipi: "SATILIK",
    kategori: "KONUT",
    searchUrl: "https://www.sahibinden.com/satilik/konut/kocaeli-golcuk",
  },
  {
    region: "Başiskele",
    il: "Kocaeli",
    ilce: "Başiskele",
    source: "sahibinden",
    islemTipi: "SATILIK",
    kategori: "KONUT",
    searchUrl: "https://www.sahibinden.com/satilik/konut/kocaeli-basiskele",
  },
];

function parseEnvSyncTargets(): FsboSyncTarget[] | null {
  const raw = process.env.FSBO_SYNC_SEARCH_URLS?.trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as FsboSyncTarget[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    const valid = parsed.filter(
      (item) =>
        item?.searchUrl?.trim() &&
        item?.region?.trim() &&
        item?.il?.trim() &&
        item?.ilce?.trim(),
    );

    return valid.length > 0 ? valid : null;
  } catch (error) {
    console.error("[fsbo-sync] FSBO_SYNC_SEARCH_URLS JSON parse hatası:", error);
    return null;
  }
}

export function getFsboSyncTargets(): FsboSyncTarget[] {
  return parseEnvSyncTargets() ?? DEFAULT_FSBO_SYNC_TARGETS;
}
