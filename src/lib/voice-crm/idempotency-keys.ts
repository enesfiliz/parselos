export function buildVoiceClientIdempotencyKey(
  agentId: string,
  voiceLogId: string,
): string {
  return `voice-client:${agentId}:${voiceLogId}`;
}
