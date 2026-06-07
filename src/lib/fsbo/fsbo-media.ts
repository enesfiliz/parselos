import type {
  FsboKategori,
  FsboLeadData,
  FsboLeadSpecs,
  FsboRadarFilters,
} from "@/lib/types/fsbo-lead";

export const FSBO_PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=640&h=480&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=640&h=480&fit=crop",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=640&h=480&fit=crop",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=640&h=480&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=640&h=480&fit=crop",
  "https://images.unsplash.com/photo-1605276374101-dee2a0ed3acc?w=640&h=480&fit=crop",
] as const;

export const KOCAELI_ILCELER = [
  "Gölcük",
  "Başiskele",
  "İzmit",
  "Kartepe",
  "Körfez",
  "Derince",
  "Çayırova",
  "Darıca",
  "Gebze",
] as const;

export type FsboSourceBadge = {
  letter: string;
  label: string;
  className: string;
};

export function getSourceBadge(source: string): FsboSourceBadge {
  const normalized = source.toLowerCase();

  if (normalized.includes("emlakjet")) {
    return {
      letter: "E",
      label: "Emlakjet",
      className: "bg-red-600 text-white",
    };
  }

  if (normalized.includes("hepsiemlak")) {
    return {
      letter: "H",
      label: "Hepsiemlak",
      className: "bg-sky-600 text-white",
    };
  }

  return {
    letter: "S",
    label: "Sahibinden",
    className: "bg-yellow-500 text-black",
  };
}

export function pickImagesForLead(seed: string, count = 4): string[] {
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const images: string[] = [];

  for (let i = 0; i < count; i += 1) {
    images.push(
      FSBO_PLACEHOLDER_IMAGES[
        (hash + i) % FSBO_PLACEHOLDER_IMAGES.length
      ],
    );
  }

  return images;
}

export function buildDefaultSpecs(
  partial: Partial<FsboLeadSpecs> & { ilanNo?: string },
): FsboLeadSpecs {
  return {
    ilanNo: partial.ilanNo ?? `FSBO-${Date.now().toString().slice(-8)}`,
    brutM2: partial.brutM2 ?? null,
    netM2: partial.netM2 ?? null,
    odaSayisi: partial.odaSayisi ?? null,
    binaYasi: partial.binaYasi ?? "Belirtilmedi",
    isitmaTipi: partial.isitmaTipi ?? "Kombi (Doğalgaz)",
  };
}

export function filterFsboLeads(
  leads: FsboLeadData[],
  filters: FsboRadarFilters,
): FsboLeadData[] {
  const min = filters.priceMin ? Number(filters.priceMin.replace(/\D/g, "")) : 0;
  const max = filters.priceMax
    ? Number(filters.priceMax.replace(/\D/g, ""))
    : Number.POSITIVE_INFINITY;

  return leads.filter((lead) => {
    if (filters.islemTipi && lead.islemTipi !== filters.islemTipi) return false;
    if (filters.kategori && lead.kategori !== filters.kategori) return false;
    if (filters.il && lead.il !== filters.il) return false;
    if (filters.ilce && lead.ilce !== filters.ilce) return false;

    const price = lead.price ?? 0;
    if (price < min) return false;
    if (Number.isFinite(max) && price > max) return false;

    return true;
  });
}

export function inferKategoriFromLead(
  lead: Pick<FsboLeadData, "kategori" | "odaSayisi" | "title">,
): FsboKategori {
  if (lead.kategori) return lead.kategori;
  const title = lead.title.toLowerCase();
  if (title.includes("arsa") || title.includes("imarlı")) return "ARSA";
  if (title.includes("dükkan") || title.includes("ticari")) return "TICARI";
  return "KONUT";
}
