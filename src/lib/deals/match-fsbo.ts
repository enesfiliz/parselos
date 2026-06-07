import type { FsboLeadData } from "@/lib/types/fsbo-lead";
import type { DealCardData } from "@/lib/types/deal";
import { resolveDealBudgetTL } from "@/lib/types/deal";

export type PropertyKind = "arsa" | "konut" | "ticari" | "any";

export type FsboPriceInsightKind = "below" | "at" | "above";

export type FsboPriceInsight = {
  kind: FsboPriceInsightKind;
  label: string;
  pctBelow?: number;
  pctAbove?: number;
  listingM2Price: number | null;
  regionalAvgM2: number | null;
};

export type FsboDealMatch = {
  lead: FsboLeadData;
  score: number;
  locationLabel: string;
  propertyTypeLabel: string;
  priceInsight: FsboPriceInsight;
};

const LOCATION_STOP_WORDS = new Set([
  "merkez",
  "kocaeli",
  "sahil",
  "bolge",
  "icin",
  "veya",
  "ilan",
  "portfoy",
  "yatirim",
  "sifir",
  "daire",
  "genis",
  "balkonlu",
  "imarli",
  "imarlı",
  "kat",
  "karsiligi",
  "karşılığı",
]);

/** Bölge × kategori bazlı simüle m² ortalama (TL) — değerleme rozeti için */
const REGIONAL_M2_AVG: Record<string, Partial<Record<PropertyKind, number>>> = {
  golcuk: { arsa: 6_800, konut: 32_000, ticari: 18_500, any: 12_000 },
  basiskele: { arsa: 7_200, konut: 38_000, ticari: 21_000, any: 14_000 },
  izmit: { arsa: 9_500, konut: 42_000, ticari: 28_000, any: 18_000 },
  gebze: { arsa: 11_000, konut: 35_000, ticari: 32_000, any: 20_000 },
  kocaeli: { arsa: 8_500, konut: 36_000, ticari: 24_000, any: 16_000 },
};

function normalizeText(v: string) {
  return v
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}+]+/gu, " ")
    .trim();
}

export function resolveDealLocation(deal: DealCardData) {
  const joined = [deal.property.mahalle, deal.property.ilce, deal.property.il]
    .filter(Boolean)
    .join(", ");
  return (
    deal.client.mulkTipi ??
    deal.listingIntel?.location ??
    (joined || "Lokasyon belirtilmedi")
  );
}

function extractLocationTerms(deal: DealCardData): string[] {
  const blob = normalizeText(
    [
      deal.property.mahalle,
      deal.property.ilce,
      deal.property.il,
      deal.listingIntel?.location,
      deal.client.mulkTipi,
      resolveDealLocation(deal),
    ]
      .filter(Boolean)
      .join(" "),
  );

  return [
    ...new Set(
      blob
        .split(" ")
        .filter((t) => t.length > 2 && !LOCATION_STOP_WORDS.has(t)),
    ),
  ];
}

export function classifyDealPropertyType(deal: DealCardData): PropertyKind {
  const text = normalizeText(
    [
      deal.client.mulkTipi,
      deal.property.ilanBasligi,
      deal.property.odaSayisi,
      deal.listingIntel?.title,
    ]
      .filter(Boolean)
      .join(" "),
  );

  if (
    text.includes("arsa") ||
    text.includes("tarla") ||
    text.includes("parsel") ||
    text.includes("imar")
  ) {
    return "arsa";
  }
  if (
    text.includes("ticari") ||
    text.includes("kupon") ||
    text.includes("ofis") ||
    text.includes("dukkan")
  ) {
    return "ticari";
  }
  if (
    deal.property.odaSayisi ||
    text.includes("daire") ||
    text.includes("villa") ||
    /\d\+\d/.test(text)
  ) {
    return "konut";
  }
  return "any";
}

export function classifyLeadPropertyType(lead: FsboLeadData): PropertyKind {
  if (lead.kategori === "ARSA") return "arsa";
  if (lead.kategori === "TICARI") return "ticari";
  if (lead.kategori === "KONUT" || lead.odaSayisi) return "konut";

  const title = normalizeText(lead.title);
  if (title.includes("arsa") || title.includes("tarla") || title.includes("parsel")) {
    return "arsa";
  }
  if (title.includes("ticari") || title.includes("kupon") || title.includes("ofis")) {
    return "ticari";
  }
  if (title.includes("daire") || title.includes("villa") || /\d\+\d/.test(title)) {
    return "konut";
  }
  return "any";
}

function propertyKindLabel(kind: PropertyKind) {
  if (kind === "arsa") return "Arsa / Tarla";
  if (kind === "konut") return "Konut";
  if (kind === "ticari") return "Ticari";
  return "Gayrimenkul";
}

function propertyTypesMatch(
  dealKind: PropertyKind,
  leadKind: PropertyKind,
): boolean {
  if (dealKind === "any" || leadKind === "any") return true;
  return dealKind === leadKind;
}

function resolveRegionalKey(lead: FsboLeadData): string {
  const blob = normalizeText(
    [lead.ilce, lead.mahalle, lead.location, lead.region, lead.il]
      .filter(Boolean)
      .join(" "),
  );
  if (blob.includes("golcuk")) return "golcuk";
  if (blob.includes("basiskele")) return "basiskele";
  if (blob.includes("gebze")) return "gebze";
  if (blob.includes("izmit")) return "izmit";
  return "kocaeli";
}

export function regionalAvgM2Price(
  lead: FsboLeadData,
  kind: PropertyKind,
): number | null {
  const region = REGIONAL_M2_AVG[resolveRegionalKey(lead)];
  if (!region) return null;
  return (
    region[kind] ??
    region.any ??
    region.konut ??
    region.arsa ??
    null
  );
}

export function evaluateFsboPriceInsight(
  lead: FsboLeadData,
  dealKind: PropertyKind,
): FsboPriceInsight {
  const m2 = lead.metrekare ?? lead.specs?.brutM2 ?? null;
  const price = lead.price;

  if (!price || !m2 || m2 <= 0) {
    return {
      kind: "at",
      label: "Piyasa Fiyatı",
      listingM2Price: null,
      regionalAvgM2: null,
    };
  }

  const leadKind = classifyLeadPropertyType(lead);
  const kind = dealKind !== "any" ? dealKind : leadKind;
  const regionalAvg = regionalAvgM2Price(lead, kind);

  if (!regionalAvg) {
    return {
      kind: "at",
      label: "Piyasa Fiyatı",
      listingM2Price: Math.round(price / m2),
      regionalAvgM2: null,
    };
  }

  const listingM2Price = price / m2;
  const diffRatio = (regionalAvg - listingM2Price) / regionalAvg;
  const pct = Math.round(Math.abs(diffRatio) * 100);

  if (diffRatio > 0.03) {
    return {
      kind: "below",
      label: `Bölge Ortalamasından %${pct} Daha Ucuz`,
      pctBelow: pct,
      listingM2Price: Math.round(listingM2Price),
      regionalAvgM2: regionalAvg,
    };
  }

  if (diffRatio < -0.03) {
    return {
      kind: "above",
      label: "Piyasa Üstü",
      pctAbove: pct,
      listingM2Price: Math.round(listingM2Price),
      regionalAvgM2: regionalAvg,
    };
  }

  return {
    kind: "at",
    label: "Piyasa Fiyatı",
    listingM2Price: Math.round(listingM2Price),
    regionalAvgM2: regionalAvg,
  };
}

function evaluateLocationMatch(
  terms: string[],
  lead: FsboLeadData,
): { hit: boolean; exact: boolean; label: string } {
  if (terms.length === 0) return { hit: false, exact: false, label: "" };

  const mahalle = lead.mahalle ? normalizeText(lead.mahalle) : "";
  const ilce = lead.ilce ? normalizeText(lead.ilce) : "";
  const leadLoc = normalizeText(
    [lead.mahalle, lead.ilce, lead.location, lead.region, lead.il]
      .filter(Boolean)
      .join(" "),
  );

  for (const term of terms) {
    if (mahalle && (mahalle === term || mahalle.includes(term))) {
      return {
        hit: true,
        exact: true,
        label: lead.mahalle ?? term,
      };
    }
    if (ilce && (ilce === term || ilce.includes(term))) {
      return { hit: true, exact: true, label: lead.ilce ?? term };
    }
    if (leadLoc.includes(term)) {
      return { hit: true, exact: term.length >= 5, label: term };
    }
  }

  return { hit: false, exact: false, label: "" };
}

function scoreMatch(input: {
  budgetMax: number;
  price: number;
  locationExact: boolean;
  locationHit: boolean;
  propertyMatch: boolean;
  priceInsight: FsboPriceInsight;
}): number {
  let score = 0;
  if (input.locationHit) score += input.locationExact ? 35 : 20;
  if (input.propertyMatch) score += 30;
  if (input.price > 0 && input.budgetMax > 0) {
    const headroom = (input.budgetMax - input.price) / input.budgetMax;
    score += Math.min(25, Math.max(0, Math.round(headroom * 40)));
  }
  if (input.priceInsight.kind === "below") score += 15;
  if (input.priceInsight.kind === "at") score += 5;
  return score;
}

export function matchFsboLeadsForDeal(
  deal: DealCardData,
  pool: FsboLeadData[],
): FsboDealMatch[] {
  const budgetMax = resolveDealBudgetTL(deal);
  const locationTerms = extractLocationTerms(deal);
  const dealPropertyType = classifyDealPropertyType(deal);

  if (!budgetMax || locationTerms.length === 0) return [];

  const matches: FsboDealMatch[] = [];

  for (const lead of pool) {
    if (!lead.price || lead.price <= 0 || lead.isDiscarded || lead.promotedDealId) {
      continue;
    }

    if (lead.price > budgetMax) continue;

    const location = evaluateLocationMatch(locationTerms, lead);
    if (!location.hit) continue;

    const leadPropertyType = classifyLeadPropertyType(lead);
    if (!propertyTypesMatch(dealPropertyType, leadPropertyType)) continue;

    const priceInsight = evaluateFsboPriceInsight(lead, dealPropertyType);
    const matchScore = scoreMatch({
      budgetMax,
      price: lead.price,
      locationExact: location.exact,
      locationHit: location.hit,
      propertyMatch: true,
      priceInsight,
    });

    matches.push({
      lead,
      score: matchScore,
      locationLabel: location.label,
      propertyTypeLabel: propertyKindLabel(leadPropertyType),
      priceInsight,
    });
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

/** @deprecated Rozet için evaluateFsboPriceInsight kullanın */
export function fsboDiscountLabel(leadId: string, index: number) {
  const seed = leadId.charCodeAt(leadId.length - 1) + index * 7;
  const pct = 10 + (seed % 11);
  return `Bölge ortalamasından %${pct} ucuz`;
}

export function fsboPlatformDisplayName(source: string) {
  return source.toLocaleLowerCase("tr-TR").includes("emlakjet")
    ? "Emlakjet"
    : "Sahibinden";
}
