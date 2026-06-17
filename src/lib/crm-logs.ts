import type { CrmVoicePayload, VoiceCrmLog } from "@/lib/types/crm";

export function normalizeCrmPayload(raw: unknown): CrmVoicePayload {
  if (!raw || typeof raw !== "object") {
    return {
      musteri_adi: "",
      butce: "",
      lokasyon: "",
      mulk_tipi: "",
      notlar: "",
    };
  }

  const record = raw as Record<string, unknown>;

  return {
    musteri_adi: String(record.musteri_adi ?? ""),
    butce: String(record.butce ?? ""),
    lokasyon: String(record.lokasyon ?? ""),
    mulk_tipi: String(record.mulk_tipi ?? ""),
    notlar: String(record.notlar ?? ""),
  };
}

export function normalizeVoiceCrmLog(row: Record<string, unknown>): VoiceCrmLog {
  return {
    id: String(row.id ?? ""),
    parsed_json_data: normalizeCrmPayload(row.parsed_json_data),
    created_at: String(row.created_at ?? new Date().toISOString()),
    transcript: typeof row.transcript === "string" ? row.transcript : null,
    status:
      row.status === "pending" ||
      row.status === "processing" ||
      row.status === "processed" ||
      row.status === "archived" ||
      row.status === "dismissed"
        ? row.status
        : "pending",
    updated_at:
      typeof row.updated_at === "string" ? row.updated_at : null,
    client_id: typeof row.client_id === "string" ? row.client_id : null,
    applied_action:
      typeof row.applied_action === "string" ? row.applied_action : null,
  };
}

export function normalizeVoiceCrmLogs(rows: Record<string, unknown>[]): VoiceCrmLog[] {
  return rows.map((row) => normalizeVoiceCrmLog(row));
}
