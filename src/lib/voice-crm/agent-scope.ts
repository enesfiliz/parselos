import type { CrmVoicePayload } from "@/lib/types/crm";

/** Migration olmadan JSONB içinde agent izolasyonu (UI alanı değil). */
export const VOICE_LOG_AGENT_ID_KEY = "__agentId";

export function voiceLogPayloadForAgent(
  agentId: string,
  data: CrmVoicePayload,
): Record<string, string> {
  return {
    ...data,
    [VOICE_LOG_AGENT_ID_KEY]: agentId,
  };
}

export function isVoiceLogOwnedByAgent(
  parsed: unknown,
  agentId: string,
): boolean {
  if (!parsed || typeof parsed !== "object") return false;
  return (
    (parsed as Record<string, unknown>)[VOICE_LOG_AGENT_ID_KEY] === agentId
  );
}
