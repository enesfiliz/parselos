import type { CrmVoicePayload, VoiceCrmConfigStatus } from "@/lib/types/crm";

export const METRIC_CARD =
  "parsel-surface flex min-h-[88px] flex-col justify-between rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm";

export const VOICE_ERROR_BANNER =
  "flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3.5 text-sm text-foreground";

export const VOICE_INFO_BANNER =
  "flex items-start gap-3 rounded-2xl border border-border/60 bg-parsel-elevated px-4 py-3.5 text-sm text-muted-foreground";

export type WorkflowStep = 1 | 2 | 3 | 4;

export const WORKFLOW_STEPS = [
  { step: 1 as const, label: "Kayıt", detail: "Saha notu" },
  { step: 2 as const, label: "Ayrıştırma", detail: "AI işleme" },
  { step: 3 as const, label: "CRM kaydı", detail: "Profil önizleme" },
  { step: 4 as const, label: "Takip", detail: "Listeye eklendi" },
];

export const CRM_PREVIEW_FIELDS: {
  key: keyof CrmVoicePayload;
  label: string;
}[] = [
  { key: "musteri_adi", label: "Müşteri" },
  { key: "butce", label: "Bütçe" },
  { key: "lokasyon", label: "Bölge" },
  { key: "mulk_tipi", label: "Mülk tipi" },
  { key: "notlar", label: "Notlar" },
];

export function inferAciliyet(notlar: string) {
  const lower = notlar.toLocaleLowerCase("tr-TR");
  if (/\b(acil|hemen|bu hafta|yarın|bugün)\b/.test(lower)) {
    return {
      label: "Yüksek",
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }
  if (/\b(orta|birkaç hafta|takip)\b/.test(lower)) {
    return {
      label: "Orta",
      className: "border-parsel-gold/30 bg-parsel-gold/10 text-parsel-gold",
    };
  }
  if (notlar.trim()) {
    return {
      label: "Normal",
      className: "border-primary/25 bg-primary/10 text-primary",
    };
  }
  return {
    label: "Belirsiz",
    className: "border-border/60 bg-parsel-elevated text-muted-foreground",
  };
}

export function formatVoiceLogDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatRelativeVoiceDate(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days < 1) return "Bugün";
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;
  return formatVoiceLogDate(value);
}

export function computeVoiceMetrics(logs: { parsed_json_data: CrmVoicePayload }[]) {
  const withBudget = logs.filter((log) => Boolean(log.parsed_json_data.butce?.trim())).length;
  const withLocation = logs.filter((log) =>
    Boolean(log.parsed_json_data.lokasyon?.trim()),
  ).length;
  const urgent = logs.filter((log) =>
    inferAciliyet(log.parsed_json_data.notlar).label === "Yüksek",
  ).length;

  return {
    total: logs.length,
    withBudget,
    withLocation,
    urgent,
  };
}

export function describeConfigStatus(status: VoiceCrmConfigStatus) {
  return [
    {
      key: "groq",
      label: "Ses sağlayıcısı",
      ready: status.groqReady,
      readyLabel: "Hazır",
      missingLabel: "Eksik",
    },
    {
      key: "storage",
      label: "Kayıt altyapısı",
      ready: status.storageReady,
      readyLabel: "Hazır",
      missingLabel: "Eksik",
    },
  ] as const;
}
