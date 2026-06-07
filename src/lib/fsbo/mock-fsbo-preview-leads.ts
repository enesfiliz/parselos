import {
  buildDefaultSpecs,
  pickImagesForLead,
} from "@/lib/fsbo/fsbo-media";
import type { FsboLeadData } from "@/lib/types/fsbo-lead";

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

function buildPreviewLead(
  partial: Omit<
    FsboLeadData,
    | "priceFormatted"
    | "images"
    | "coverImage"
    | "specs"
    | "description"
    | "isRead"
    | "isDiscarded"
    | "promotedDealId"
    | "listedAt"
    | "olusturulmaTarihi"
  > & {
    specs?: Partial<FsboLeadData["specs"]>;
    description?: string;
    listedDaysAgo?: number;
  },
): FsboLeadData {
  const images = pickImagesForLead(partial.id, 5);
  const priceFormatted = partial.price
    ? new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 0,
      }).format(partial.price)
    : "Fiyat belirtilmedi";

  return {
    ...partial,
    priceFormatted,
    images,
    coverImage: images[0],
    specs: buildDefaultSpecs({
      ilanNo: partial.listingNo ?? `SB-${partial.id.slice(-6).toUpperCase()}`,
      brutM2: partial.metrekare,
      netM2: partial.metrekare ? Math.round(partial.metrekare * 0.88) : null,
      odaSayisi: partial.odaSayisi,
      binaYasi: partial.specs?.binaYasi ?? "8",
      isitmaTipi: partial.specs?.isitmaTipi ?? "Kombi (Doğalgaz)",
      ...partial.specs,
    }),
    description:
      partial.description ??
      `${partial.title}. ${partial.location} bölgesinde doğrudan mal sahibinden FSBO önizleme kaydı.`,
    isRead: false,
    isDiscarded: false,
    promotedDealId: null,
    listedAt: daysAgo(partial.listedDaysAgo ?? 1),
    olusturulmaTarihi: daysAgo(partial.listedDaysAgo ?? 1),
  };
}

export const MOCK_FSBO_PREVIEW_LEADS: FsboLeadData[] = [
  buildPreviewLead({
    id: "fsbo-mock-001",
    title: "Gölcükte Deniz Manzaralı 3+1 Müstakil Villa",
    url: "https://www.sahibinden.com/ilan/emlak-konut-satilik-preview-001",
    price: 5_500_000,
    location: "Uğurtepe, Gölcük, Kocaeli",
    region: "Kocaeli/Gölcük",
    il: "Kocaeli",
    ilce: "Gölcük",
    mahalle: "Uğurtepe",
    metrekare: 165,
    odaSayisi: "3+1",
    source: "sahibinden",
    islemTipi: "SATILIK",
    kategori: "KONUT",
    listingNo: "SB-PREVIEW-001",
    listedDaysAgo: 0,
    specs: { binaYasi: "6", isitmaTipi: "Kombi (Doğalgaz)" },
  }),
  buildPreviewLead({
    id: "fsbo-mock-002",
    title: "Başiskele Yeniköy Havuzlu 5+2 Villa",
    url: "https://www.sahibinden.com/ilan/emlak-konut-satilik-preview-002",
    price: 8_200_000,
    location: "Yeniköy, Başiskele, Kocaeli",
    region: "Kocaeli/Başiskele",
    il: "Kocaeli",
    ilce: "Başiskele",
    mahalle: "Yeniköy",
    metrekare: 280,
    odaSayisi: "5+2",
    source: "sahibinden",
    islemTipi: "SATILIK",
    kategori: "KONUT",
    listingNo: "SB-PREVIEW-002",
    listedDaysAgo: 1,
    specs: { binaYasi: "3", isitmaTipi: "Merkezi Sistem" },
  }),
  buildPreviewLead({
    id: "fsbo-mock-003",
    title: "Gölcük Hisareyn Merkez 2+1 Daire",
    url: "https://www.emlakjet.com/ilan/preview-003",
    price: 2_450_000,
    location: "Hisareyn, Gölcük, Kocaeli",
    region: "Kocaeli/Gölcük",
    il: "Kocaeli",
    ilce: "Gölcük",
    mahalle: "Hisareyn",
    metrekare: 88,
    odaSayisi: "2+1",
    source: "emlakjet",
    islemTipi: "SATILIK",
    kategori: "KONUT",
    listingNo: "EJ-PREVIEW-003",
    listedDaysAgo: 2,
  }),
  buildPreviewLead({
    id: "fsbo-mock-004",
    title: "Başiskele Kullar Cadde Üstü Ticari Dükkan",
    url: "https://www.sahibinden.com/ilan/emlak-ticari-preview-004",
    price: 5_600_000,
    location: "Kullar, Başiskele, Kocaeli",
    region: "Kocaeli/Başiskele",
    il: "Kocaeli",
    ilce: "Başiskele",
    mahalle: "Kullar",
    metrekare: 110,
    odaSayisi: null,
    source: "sahibinden",
    islemTipi: "SATILIK",
    kategori: "TICARI",
    listingNo: "SB-PREVIEW-004",
    listedDaysAgo: 3,
    specs: { binaYasi: "22", isitmaTipi: "Klima" },
  }),
];
