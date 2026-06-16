import type { Prisma } from "@prisma/client";

export type FsboPriority = "low" | "medium" | "high";
export type FsboTrackingStatus =
  | "watching"
  | "contacted"
  | "follow_up"
  | "negotiating"
  | "closed";

export type FsboTrackingMeta = {
  priority: FsboPriority;
  trackingStatus: FsboTrackingStatus;
  manualEntry: boolean;
};

export const FSBO_PRIORITY_LABELS: Record<FsboPriority, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

export const FSBO_TRACKING_STATUS_LABELS: Record<FsboTrackingStatus, string> = {
  watching: "İzleniyor",
  contacted: "İletişim kuruldu",
  follow_up: "Takip bekliyor",
  negotiating: "Görüşmede",
  closed: "Kapatıldı",
};

export const FSBO_PRODUCT_DISCLAIMER =
  "Otomatik veri çekme desteklenmiyor. Kaynak linkler arşivlenir; başlık, fiyat ve notlar manuel girilir.";

export const FSBO_AUTO_SYNC_DISABLED_MESSAGE =
  "Otomatik FSBO senkronizasyonu devre dışı. Manuel fırsat takibi kullanılıyor.";

export const FSBO_AUTO_IMPORT_DISABLED_MESSAGE =
  "Otomatik ilan içe aktarma devre dışı. Manuel fırsat ekleme endpointini kullanın: POST /api/fsbo-leads/manual";

export const FSBO_BOT_IMPORT_DISABLED_MESSAGE =
  "FSBO bot import devre dışı. Agent-scoped manuel fırsat takibi kullanılıyor.";

export function isPublicSourceUrl(url?: string | null) {
  if (!url?.trim()) return false;
  if (url.startsWith("parselos-manual:")) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildManualLeadUrl(agentId: string) {
  return `parselos-manual:${agentId}:${crypto.randomUUID()}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseTrackingMeta(
  specs: Prisma.JsonValue | null,
  source: string,
): FsboTrackingMeta {
  if (isRecord(specs)) {
    const priority =
      specs.priority === "low" ||
      specs.priority === "medium" ||
      specs.priority === "high"
        ? specs.priority
        : "medium";
    const trackingStatus =
      specs.trackingStatus === "watching" ||
      specs.trackingStatus === "contacted" ||
      specs.trackingStatus === "follow_up" ||
      specs.trackingStatus === "negotiating" ||
      specs.trackingStatus === "closed"
        ? specs.trackingStatus
        : "watching";

    return {
      priority,
      trackingStatus,
      manualEntry:
        specs.manualEntry === true || source.toLowerCase() === "manual",
    };
  }

  return {
    priority: "medium",
    trackingStatus: "watching",
    manualEntry: source.toLowerCase() === "manual",
  };
}

export function buildTrackingSpecs(input: {
  priority: FsboPriority;
  trackingStatus: FsboTrackingStatus;
  manualEntry?: boolean;
  ilanNo?: string;
  brutM2?: number | null;
  odaSayisi?: string | null;
}): Prisma.InputJsonValue {
  return {
    ilanNo: input.ilanNo,
    brutM2: input.brutM2 ?? null,
    odaSayisi: input.odaSayisi ?? null,
    priority: input.priority,
    trackingStatus: input.trackingStatus,
    manualEntry: input.manualEntry ?? true,
  };
}

export function formatFsboRelativeTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffDays = Math.floor((date.getTime() - Date.now()) / 86_400_000);
  if (diffDays === 0) return "Bugün";
  if (diffDays === 1) return "Yarın";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} gün sonra`;
  if (diffDays < 0) return `${Math.abs(diffDays)} gün önce`;

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

export function computeFsboTrackMetrics(leads: Array<{
  trackingStatus: FsboTrackingStatus;
  priority: FsboPriority;
  isTracked?: boolean;
  nextFollowUpAt: string | null;
}>) {
  const active = leads.filter((lead) => lead.trackingStatus !== "closed").length;
  const highPriority = leads.filter((lead) => lead.priority === "high").length;
  const followUpDue = leads.filter((lead) => {
    if (!lead.nextFollowUpAt) return false;
    const date = new Date(lead.nextFollowUpAt);
    return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
  }).length;

  return {
    total: leads.length,
    active,
    highPriority,
    followUpDue,
  };
}
