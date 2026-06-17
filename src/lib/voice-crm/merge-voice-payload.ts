import type { CrmVoicePayload } from "@/lib/types/crm";

function pickField(current: string | undefined, incoming: string): string {
  const next = incoming.trim();
  if (next) return next;
  return current?.trim() ?? "";
}

export function mergeVoicePayload(
  existing: CrmVoicePayload,
  incoming: CrmVoicePayload,
): CrmVoicePayload {
  const mergedNotes = mergeVoiceNotes(existing.notlar, incoming.notlar);

  return {
    musteri_adi: pickField(existing.musteri_adi, incoming.musteri_adi),
    butce: pickField(existing.butce, incoming.butce),
    lokasyon: pickField(existing.lokasyon, incoming.lokasyon),
    mulk_tipi: pickField(existing.mulk_tipi, incoming.mulk_tipi),
    notlar: mergedNotes,
    telefon: pickField(existing.telefon, incoming.telefon ?? ""),
    eposta: pickField(existing.eposta, incoming.eposta ?? ""),
    niyet: pickField(existing.niyet, incoming.niyet ?? ""),
    aciliyet: pickField(existing.aciliyet, incoming.aciliyet ?? ""),
    takip_tarihi: pickField(existing.takip_tarihi, incoming.takip_tarihi ?? ""),
  };
}

export function mergeVoiceNotes(existing: string, incoming: string): string {
  const base = existing?.trim() ?? "";
  const next = incoming.trim();
  if (!base) return next;
  if (!next) return base;
  if (base.includes(next)) return base;
  return `${base}\n\n${next}`;
}

export function mergeVoiceTranscript(
  existing: string | null | undefined,
  incoming: string,
): string {
  const base = existing?.trim() ?? "";
  const next = incoming.trim();
  if (!base) return next;
  if (!next) return base;
  return `${base}\n\n---\n\n${next}`;
}
