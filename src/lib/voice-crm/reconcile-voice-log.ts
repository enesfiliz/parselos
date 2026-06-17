import "server-only";

import type { VoiceCrmLog } from "@/lib/types/crm";

import { buildVoiceClientIdempotencyKey } from "./idempotency-keys";
import { getVoiceLogForAgent, updateVoiceLogForAgent } from "./voice-log-store";

export async function syncVoiceLogAfterClientCreate(
  voiceLogId: string,
  agentId: string,
  clientId: string,
): Promise<VoiceCrmLog | null> {
  return updateVoiceLogForAgent(voiceLogId, agentId, {
    status: "processed",
    clientId,
    appliedAction: "create_client",
  });
}

export async function reconcileVoiceLogFromLedger(
  agentId: string,
  voiceLogId: string,
  targetClientId: string,
): Promise<VoiceCrmLog | null> {
  const log = await getVoiceLogForAgent(voiceLogId, agentId);
  if (!log) return null;

  if (log.client_id === targetClientId && log.status === "processed") {
    return log;
  }

  return syncVoiceLogAfterClientCreate(voiceLogId, agentId, targetClientId);
}

export function ledgerKeyForVoiceLog(agentId: string, voiceLogId: string): string {
  return buildVoiceClientIdempotencyKey(agentId, voiceLogId);
}
