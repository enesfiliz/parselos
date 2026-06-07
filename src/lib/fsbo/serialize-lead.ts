import type { FsboLead } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import {
  buildDefaultSpecs,
  pickImagesForLead,
} from "@/lib/fsbo/fsbo-media";
import type {
  FsboIslemTipi,
  FsboKategori,
  FsboLeadData,
  FsboLeadSpecs,
} from "@/lib/types/fsbo-lead";

export function formatFsboPrice(value: number | null | undefined): string {
  if (!value || value <= 0) return "Fiyat belirtilmedi";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseSpecs(
  value: Prisma.JsonValue | null,
  lead: FsboLead,
): FsboLeadSpecs {
  if (isRecord(value)) {
    return buildDefaultSpecs({
      ilanNo:
        typeof value.ilanNo === "string"
          ? value.ilanNo
          : (lead.listingNo ?? `FSBO-${lead.id.slice(0, 8).toUpperCase()}`),
      brutM2:
        typeof value.brutM2 === "number"
          ? value.brutM2
          : typeof value.m2 === "number"
            ? value.m2
            : (lead.metrekare ?? null),
      netM2: typeof value.netM2 === "number" ? value.netM2 : null,
      odaSayisi:
        typeof value.odaSayisi === "string"
          ? value.odaSayisi
          : lead.odaSayisi,
      binaYasi:
        typeof value.binaYasi === "string" ? value.binaYasi : "Belirtilmedi",
      isitmaTipi:
        typeof value.isitmaTipi === "string"
          ? value.isitmaTipi
          : "Kombi (Doğalgaz)",
    });
  }

  return buildDefaultSpecs({
    ilanNo: lead.listingNo ?? `FSBO-${lead.id.slice(0, 8).toUpperCase()}`,
    brutM2: lead.metrekare,
    netM2: lead.metrekare ? Math.round(lead.metrekare * 0.88) : null,
    odaSayisi: lead.odaSayisi,
  });
}

function parseImages(images: string[], leadId: string): string[] {
  if (images.length > 0) return images;
  return pickImagesForLead(leadId, 5);
}

function parseIslemTipi(value: string | null): FsboIslemTipi {
  return value === "KIRALIK" ? "KIRALIK" : "SATILIK";
}

function parseKategori(value: string | null, title: string): FsboKategori {
  if (value === "ARSA" || value === "TICARI" || value === "KONUT") {
    return value;
  }
  const lower = title.toLowerCase();
  if (lower.includes("arsa")) return "ARSA";
  if (lower.includes("dükkan") || lower.includes("ticari")) return "TICARI";
  return "KONUT";
}

export function serializeFsboLead(lead: FsboLead): FsboLeadData {
  const price = lead.price > 0 ? lead.price : null;
  const images = parseImages(lead.images, lead.id);
  const location = lead.location ?? lead.region;

  return {
    id: lead.id,
    title: lead.title,
    url: lead.url,
    price: Number.isNaN(price) ? null : price,
    priceFormatted: formatFsboPrice(price),
    location,
    region: lead.region,
    il: lead.il,
    ilce: lead.ilce,
    mahalle: lead.mahalle,
    metrekare: lead.metrekare,
    odaSayisi: lead.odaSayisi,
    source: lead.source,
    islemTipi: parseIslemTipi(lead.islemTipi),
    kategori: parseKategori(lead.kategori, lead.title),
    listingNo: lead.listingNo,
    description:
      lead.description ??
      `${lead.title}. ${location} bölgesinde FSBO istihbarat kaydı.`,
    images,
    coverImage: images[0],
    specs: parseSpecs(lead.specs, lead),
    isRead: lead.isRead,
    isDiscarded: lead.isDiscarded,
    promotedDealId: lead.promotedDealId,
    listedAt: lead.listedAt?.toISOString() ?? null,
    olusturulmaTarihi: lead.createdAt.toISOString(),
  };
}
