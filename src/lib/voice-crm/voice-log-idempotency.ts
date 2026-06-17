import { createHash } from "node:crypto";

export function buildVoiceIdempotencyKey(
  agentId: string,
  transcript: string,
  audioSize: number,
): string {
  return createHash("sha256")
    .update(`${agentId}:${transcript.trim().toLowerCase()}:${audioSize}`)
    .digest("hex");
}
