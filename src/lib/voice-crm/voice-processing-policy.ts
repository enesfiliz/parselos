/** Sesli CRM processing claim ve Prisma ledger için ortak timeout. */
export const VOICE_PROCESSING_STALE_MS = 5 * 60 * 1000;

export const VOICE_IN_PROGRESS_USER_MESSAGE =
  "İşlem devam ediyor. Lütfen birkaç saniye sonra tekrar deneyin.";

export const VOICE_RETRY_USER_MESSAGE =
  "İşlem tamamlanamadı. Tekrar deneyebilirsiniz.";

export function isVoiceProcessingStale(
  updatedAtIso: string | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!updatedAtIso) return true;
  const updatedAt = Date.parse(updatedAtIso);
  if (Number.isNaN(updatedAt)) return true;
  return nowMs - updatedAt > VOICE_PROCESSING_STALE_MS;
}

export type VoiceClaimDecision =
  | "claim_pending"
  | "in_progress"
  | "resume_stale"
  | "denied"
  | "already_linked";

export function resolveVoiceClaimDecision(input: {
  status?: string | null;
  clientId?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  nowMs?: number;
}): VoiceClaimDecision {
  if (input.clientId) return "already_linked";

  const timestamp = input.updatedAt ?? input.createdAt ?? "";

  if (input.status === "pending") return "claim_pending";

  if (input.status === "processing") {
    return isVoiceProcessingStale(timestamp, input.nowMs)
      ? "resume_stale"
      : "in_progress";
  }

  return "denied";
}

export function staleProcessingCutoffIso(
  nowMs: number = Date.now(),
): string {
  return new Date(nowMs - VOICE_PROCESSING_STALE_MS).toISOString();
}
