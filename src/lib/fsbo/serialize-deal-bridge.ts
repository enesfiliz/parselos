import type {
  BuyerMatch,
  DealCardData,
  DealTask,
  ListingIntel,
} from "@/lib/types/deal";
import type { Prisma } from "@prisma/client";

function parseDealTasks(value: Prisma.JsonValue | null): DealTask[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const tasks = value
    .map((item) => {
      if (!isRecord(item)) return null;
      const id = item.id;
      const label = item.label;
      const completed = item.completed;
      if (
        typeof id !== "string" ||
        typeof label !== "string" ||
        typeof completed !== "boolean"
      ) {
        return null;
      }
      return { id, label, completed };
    })
    .filter((task): task is DealTask => task !== null);

  return tasks.length > 0 ? tasks : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseBuyerMatch(
  value: Prisma.JsonValue | null,
): BuyerMatch | null | undefined {
  if (!isRecord(value)) return value === null ? null : undefined;

  const clientId = value.clientId;
  const adSoyad = value.adSoyad;
  const score = value.score;
  const reasons = value.reasons;
  const matchedAt = value.matchedAt;

  if (
    typeof clientId !== "string" ||
    typeof adSoyad !== "string" ||
    typeof score !== "number" ||
    !Array.isArray(reasons) ||
    typeof matchedAt !== "string"
  ) {
    return undefined;
  }

  return {
    clientId,
    adSoyad,
    telefon: typeof value.telefon === "string" ? value.telefon : null,
    score,
    reasons: reasons.filter((r): r is string => typeof r === "string"),
    matchedAt,
  };
}

function parseListingIntel(
  value: Prisma.JsonValue | null,
): ListingIntel | null | undefined {
  if (!isRecord(value)) return value === null ? null : undefined;

  const fiyat = value.fiyat;
  const ilanTarihi = value.ilanTarihi;
  const metrekare = value.metrekare;

  if (
    typeof fiyat !== "string" ||
    typeof ilanTarihi !== "string" ||
    typeof metrekare !== "string"
  ) {
    return undefined;
  }

  return {
    fiyat,
    ilanTarihi,
    metrekare,
    source: typeof value.source === "string" ? value.source : undefined,
    title: typeof value.title === "string" ? value.title : undefined,
    location: typeof value.location === "string" ? value.location : undefined,
  };
}

export function serializeDeal(
  deal: Prisma.DealGetPayload<{
    include: { client: true; property: true };
  }>,
): DealCardData {
  return {
    id: deal.id,
    stage: deal.stage,
    notlar: deal.notlar,
    etiket: deal.etiket,
    sonIletisim: deal.sonIletisim,
    budgetTL: deal.budgetTL,
    tasks: parseDealTasks(deal.tasks),
    listingUrl: deal.listingUrl,
    fsboLeadId: deal.fsboLeadId,
    listingIntel: parseListingIntel(deal.listingIntel),
    buyerMatch: parseBuyerMatch(deal.buyerMatch),
    olusturulmaTarihi: deal.olusturulmaTarihi.toISOString(),
    guncellenmeTarihi: deal.guncellenmeTarihi.toISOString(),
    client: {
      id: deal.client.id,
      adSoyad: deal.client.adSoyad,
      telefon: deal.client.telefon,
      email: deal.client.email,
      kaynak: deal.client.kaynak,
      butce: deal.client.butce,
      mulkTipi: deal.client.mulkTipi,
    },
    property: {
      id: deal.property.id,
      ilanBasligi: deal.property.ilanBasligi,
      fiyat: deal.property.fiyat?.toString() ?? null,
      il: deal.property.il,
      ilce: deal.property.ilce,
      mahalle: deal.property.mahalle,
      ada: deal.property.ada,
      parsel: deal.property.parsel,
      durum: deal.property.durum,
      tur: deal.property.tur,
      odaSayisi: deal.property.odaSayisi,
      metrekare: deal.property.metrekare,
    },
  };
}
