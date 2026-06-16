import type {
  ImarRadarApiAnnouncement,
  ImarRadarFilters,
  ImarRadarItem,
  ImarRecordCategory,
  ImarTrustStatus,
  ManualImarRecord,
} from "@/lib/radar/imar-radar-types";

export const IMAR_CATEGORY_LABELS: Record<ImarRecordCategory, string> = {
  aski: "Askı ilanı",
  "plan-degisikligi": "Plan değişikliği",
  parsel: "Parsel duyurusu",
  sanayi: "Sanayi alanı",
  duyuru: "Resmi duyuru",
  manuel: "Manuel takip",
};

export const IMAR_TRUST_LABELS: Record<ImarTrustStatus, string> = {
  verified: "Doğrulandı",
  source_pending: "Kaynak bekliyor",
  manual: "Manuel takip",
  needs_official_check: "Resmi kaynaktan kontrol edilmeli",
};

export const IMAR_TRUST_STYLES: Record<ImarTrustStatus, string> = {
  verified: "border-primary/25 bg-primary/10 text-primary",
  source_pending: "border-border/60 bg-parsel-elevated text-muted-foreground",
  manual: "border-parsel-gold/30 bg-parsel-gold/10 text-parsel-gold",
  needs_official_check: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export const IMAR_OFFICIAL_DISCLAIMER =
  "İmar bilgileri işlem öncesi resmi kaynaklardan teyit edilmelidir.";

export function isValidSourceUrl(value?: string) {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeApiCategory(
  category: ImarRadarApiAnnouncement["category"],
): ImarRecordCategory {
  if (category === "diger") return "duyuru";
  return category;
}

export function resolveTrustStatus(input: {
  origin: ImarRadarItem["origin"];
  sourceUrl?: string;
  userVerified?: boolean;
}): ImarTrustStatus {
  if (input.origin === "manual") return "manual";
  if (input.userVerified) return "verified";
  if (isValidSourceUrl(input.sourceUrl)) return "needs_official_check";
  return "source_pending";
}

export function buildCardSummary(item: {
  title: string;
  summary: string;
  region: string;
  category: ImarRecordCategory;
  matchedKeywords: string[];
  source?: string;
}): string {
  const trimmedSummary = item.summary.trim();
  if (
    trimmedSummary.length > 0 &&
    trimmedSummary !== item.title &&
    trimmedSummary.length >= item.title.length + 12
  ) {
    return trimmedSummary;
  }

  const typeLabel = IMAR_CATEGORY_LABELS[item.category].toLowerCase();
  const keywords =
    item.matchedKeywords.length > 0
      ? ` Eşleşen terimler: ${item.matchedKeywords.slice(0, 4).join(", ")}.`
      : "";
  const source = item.source ? ` Kaynak: ${item.source}.` : "";

  return `${item.region} bölgesinde ${typeLabel} kapsamında “${item.title}” başlıklı kayıt izleniyor.${keywords}${source} ${IMAR_OFFICIAL_DISCLAIMER}`;
}

export function apiAnnouncementToItem(
  item: ImarRadarApiAnnouncement,
  trackingMeta?: { tracked?: boolean; userVerified?: boolean; note?: string },
): ImarRadarItem {
  const category = normalizeApiCategory(item.category);
  const sourceUrl = isValidSourceUrl(item.sourceUrl) ? item.sourceUrl : undefined;

  return {
    id: item.id,
    origin: "api",
    title: item.title,
    summary: buildCardSummary({
      title: item.title,
      summary: item.summary,
      region: item.region,
      category,
      matchedKeywords: item.matchedKeywords,
      source: item.source,
    }),
    region: item.region,
    source: item.source,
    sourceUrl,
    category,
    trustStatus: resolveTrustStatus({
      origin: "api",
      sourceUrl,
      userVerified: trackingMeta?.userVerified,
    }),
    publishedAt: item.publishedAt,
    matchedKeywords: item.matchedKeywords,
    isNew: item.isNew,
    isTracked: trackingMeta?.tracked ?? false,
    verificationNote: trackingMeta?.note,
  };
}

export function manualRecordToItem(record: ManualImarRecord): ImarRadarItem {
  const sourceUrl = isValidSourceUrl(record.sourceUrl) ? record.sourceUrl : undefined;

  return {
    id: record.id,
    origin: "manual",
    title: record.title,
    summary:
      record.summary.trim() ||
      buildCardSummary({
        title: record.title,
        summary: "",
        region: record.region,
        category: record.category,
        matchedKeywords: [],
      }),
    region: record.region,
    source: "Manuel kayıt",
    sourceUrl,
    category: record.category,
    trustStatus: "manual",
    publishedAt: record.updatedAt,
    matchedKeywords: [],
    isNew: false,
    isTracked: record.tracking,
    verificationNote: record.verificationNote,
  };
}

export function formatImarRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (diffMinutes < 1) return "Az önce";
  if (diffMinutes < 60) return `${diffMinutes} dk önce`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} sa önce`;

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function matchesImarFilters(item: ImarRadarItem, filters: ImarRadarFilters) {
  if (filters.trackedOnly && !item.isTracked) return false;
  if (filters.category !== "all" && item.category !== filters.category) return false;
  if (filters.trust !== "all" && item.trustStatus !== filters.trust) return false;

  const query = filters.query.trim().toLocaleLowerCase("tr-TR");
  if (!query) return true;

  const haystack = [
    item.title,
    item.summary,
    item.region,
    item.source,
    IMAR_CATEGORY_LABELS[item.category],
    IMAR_TRUST_LABELS[item.trustStatus],
    item.matchedKeywords.join(" "),
    item.verificationNote,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");

  return haystack.includes(query);
}

export function computeImarMetrics(items: ImarRadarItem[], trackedRegions: string[]) {
  const activeSuspension = items.filter(
    (item) => item.category === "aski" || item.category === "plan-degisikligi",
  ).length;
  const verifiedCount = items.filter((item) => item.trustStatus === "verified").length;
  const criticalCount = items.filter(
    (item) => item.isNew || (item.isTracked && item.trustStatus !== "verified"),
  ).length;

  return {
    trackedRegions: trackedRegions.length,
    activeSuspension,
    verifiedCount,
    criticalCount,
    total: items.length,
    trackedItems: items.filter((item) => item.isTracked).length,
  };
}

export function parseRegionParts(region: string) {
  const parts = region
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    district: parts[0] ?? region,
    city: parts[1] ?? parts[0] ?? region,
  };
}
