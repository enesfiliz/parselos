import { resolveDealBudgetTL, type DealCardData } from "@/lib/types/deal";

/** Ham eşleşme puanını (0–110) ekranda gösterilecek %85–98 bandına çevirir */
export function rawScoreToMatchPercent(raw: number): number {
  const clamped = Math.min(110, Math.max(0, raw));
  const pct = 85 + Math.round((clamped / 110) * 13);
  return Math.min(98, Math.max(85, pct));
}

/** FSBO eşleşme satırı için yüzde skor */
export function formatFsboMatchPercent(rawScore: number): number {
  return rawScoreToMatchPercent(rawScore);
}

function normalizeToken(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Kanban kartı için müşteri kriterleri × ilan verisi uyum skoru.
 * buyerMatch varsa öncelikli kullanılır.
 */
export function computeDealMatchPercent(deal: DealCardData): number {
  if (deal.buyerMatch?.score != null) {
    return rawScoreToMatchPercent(deal.buyerMatch.score);
  }

  const budgetMax = resolveDealBudgetTL(deal);
  const price =
    deal.property.fiyat != null
      ? Number(deal.property.fiyat)
      : (deal.budgetTL ?? 0);

  let points = 48;

  if (budgetMax > 0 && price > 0) {
    if (price <= budgetMax) {
      const headroom = (budgetMax - price) / budgetMax;
      points += Math.min(32, Math.round(headroom * 55));
    } else {
      points -= 12;
    }
  }

  const clientBlob = normalizeToken(deal.client.mulkTipi ?? "");
  const locParts = [
    deal.property.mahalle,
    deal.property.ilce,
    deal.property.il,
    deal.listingIntel?.location,
  ].filter(Boolean) as string[];

  for (const part of locParts) {
    const token = normalizeToken(part);
    if (token.length > 2 && clientBlob.includes(token)) {
      points += 18;
      break;
    }
  }

  if (deal.etiket === "FSBO" || deal.listingUrl) {
    points += 6;
  }

  const seed = [...deal.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  points += seed % 9;

  return rawScoreToMatchPercent(points);
}

const GENERIC_PROPERTY_TITLES = new Set([
  "yeni portföy",
  "yeni portfoy",
  "yeni mülk",
]);

function hasFsboListingSignal(deal: DealCardData) {
  return (
    deal.etiket === "FSBO" ||
    Boolean(deal.listingUrl) ||
    Boolean(deal.fsboLeadId) ||
    Boolean(deal.listingIntel?.title) ||
    deal.property.tur === "FSBO"
  );
}

function resolveListingTitle(deal: DealCardData) {
  const raw =
    deal.listingIntel?.title?.trim() ||
    deal.property.ilanBasligi?.trim() ||
    "";

  if (!raw) return null;

  const normalized = raw.toLocaleLowerCase("tr-TR");
  if (GENERIC_PROPERTY_TITLES.has(normalized)) return null;

  return raw;
}

/**
 * Kanban kartında gösterilecek istihbarat satırı.
 * Yalnızca müşteriye bağlı / sisteme düşmüş FSBO ilanı varsa döner.
 */
export function resolveDealIntelligenceInsight(
  deal: DealCardData,
): { listingTitle: string; percent: number } | null {
  if (!hasFsboListingSignal(deal)) return null;

  const listingTitle = resolveListingTitle(deal);
  if (!listingTitle) return null;

  return {
    listingTitle,
    percent: computeDealMatchPercent(deal),
  };
}
