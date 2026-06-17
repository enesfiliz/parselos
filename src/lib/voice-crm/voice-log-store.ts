import "server-only";

import { normalizeVoiceCrmLog } from "@/lib/crm-logs";
import { createSupabaseAdmin } from "@/lib/supabase";
import type { CrmVoicePayload, VoiceCrmLog, VoiceLogStatus } from "@/lib/types/crm";

import { isVoiceLogOwnedByAgent, voiceLogPayloadForAgent, VOICE_LOG_AGENT_ID_KEY } from "./agent-scope";
import {
  isVoiceProcessingStale,
  resolveVoiceClaimDecision,
  staleProcessingCutoffIso,
} from "./voice-processing-policy";

export type VoiceLogRow = Record<string, unknown>;

export type VoiceClaimResult =
  | { kind: "claimed"; log: VoiceCrmLog }
  | { kind: "stale_claimed"; log: VoiceCrmLog }
  | { kind: "in_progress"; log: VoiceCrmLog }
  | { kind: "denied" };

function isUniqueViolation(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === "23505" || error.message?.includes("duplicate key") === true;
}

export async function findVoiceLogByIdempotencyKey(
  agentId: string,
  idempotencyKey: string,
): Promise<VoiceCrmLog | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("voice_crm_logs")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .contains("parsed_json_data", { [VOICE_LOG_AGENT_ID_KEY]: agentId })
    .maybeSingle();

  if (error || !data) return null;

  const row = data as VoiceLogRow;
  if (!isVoiceLogOwnedByAgent(row.parsed_json_data, agentId)) return null;

  return normalizeVoiceCrmLog(row);
}

export async function insertPendingVoiceLog(input: {
  agentId: string;
  transcript: string;
  payload: CrmVoicePayload;
  idempotencyKey: string;
}): Promise<VoiceCrmLog> {
  const existing = await findVoiceLogByIdempotencyKey(
    input.agentId,
    input.idempotencyKey,
  );
  if (existing) return existing;

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("voice_crm_logs")
    .insert({
      transcript: input.transcript,
      status: "pending",
      idempotency_key: input.idempotencyKey,
      parsed_json_data: voiceLogPayloadForAgent(input.agentId, input.payload),
    })
    .select("*")
    .single();

  if (!error && data) {
    return normalizeVoiceCrmLog(data as VoiceLogRow);
  }

  if (isUniqueViolation(error)) {
    const raced = await findVoiceLogByIdempotencyKey(
      input.agentId,
      input.idempotencyKey,
    );
    if (raced) return raced;
  }

  throw new Error("Kayıt geçmişi şu anda görüntülenemiyor.");
}

export async function getVoiceLogForAgent(
  logId: string,
  agentId: string,
): Promise<VoiceCrmLog | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("voice_crm_logs")
    .select("*")
    .eq("id", logId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as VoiceLogRow;
  if (!isVoiceLogOwnedByAgent(row.parsed_json_data, agentId)) return null;

  return normalizeVoiceCrmLog(row);
}

async function claimPendingVoiceLog(
  logId: string,
  agentId: string,
): Promise<VoiceCrmLog | null> {
  const supabase = createSupabaseAdmin();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("voice_crm_logs")
    .update({
      status: "processing",
      applied_action: "create_client",
      updated_at: nowIso,
    })
    .eq("id", logId)
    .eq("status", "pending")
    .is("client_id", null)
    .contains("parsed_json_data", { [VOICE_LOG_AGENT_ID_KEY]: agentId })
    .select("*")
    .maybeSingle();

  if (error || !data) return null;

  const row = data as VoiceLogRow;
  if (!isVoiceLogOwnedByAgent(row.parsed_json_data, agentId)) return null;

  return normalizeVoiceCrmLog(row);
}

async function resumeStaleProcessingClaim(
  logId: string,
  agentId: string,
): Promise<VoiceCrmLog | null> {
  const supabase = createSupabaseAdmin();
  const nowIso = new Date().toISOString();
  const staleBefore = staleProcessingCutoffIso();

  const { data, error } = await supabase
    .from("voice_crm_logs")
    .update({
      status: "processing",
      applied_action: "create_client",
      updated_at: nowIso,
    })
    .eq("id", logId)
    .eq("status", "processing")
    .is("client_id", null)
    .lte("updated_at", staleBefore)
    .contains("parsed_json_data", { [VOICE_LOG_AGENT_ID_KEY]: agentId })
    .select("*")
    .maybeSingle();

  if (error || !data) return null;

  const row = data as VoiceLogRow;
  if (!isVoiceLogOwnedByAgent(row.parsed_json_data, agentId)) return null;

  return normalizeVoiceCrmLog(row);
}

export async function claimVoiceLogForClientCreation(
  logId: string,
  agentId: string,
): Promise<VoiceClaimResult> {
  const pendingClaim = await claimPendingVoiceLog(logId, agentId);
  if (pendingClaim) {
    return { kind: "claimed", log: pendingClaim };
  }

  const current = await getVoiceLogForAgent(logId, agentId);
  if (!current) {
    return { kind: "denied" };
  }

  const decision = resolveVoiceClaimDecision({
    status: current.status,
    clientId: current.client_id,
    updatedAt: current.updated_at,
    createdAt: current.created_at,
  });

  if (decision === "already_linked") {
    return { kind: "denied" };
  }

  if (decision === "in_progress") {
    return { kind: "in_progress", log: current };
  }

  if (decision === "resume_stale") {
    const resumed = await resumeStaleProcessingClaim(logId, agentId);
    if (resumed) {
      return { kind: "stale_claimed", log: resumed };
    }

    const raced = await getVoiceLogForAgent(logId, agentId);
    if (!raced) return { kind: "denied" };

    if (
      raced.status === "processing" &&
      !isVoiceProcessingStale(raced.updated_at ?? raced.created_at)
    ) {
      return { kind: "in_progress", log: raced };
    }

    if (raced.status === "processing") {
      return { kind: "stale_claimed", log: raced };
    }
  }

  return { kind: "denied" };
}

export async function releaseVoiceLogProcessingClaim(
  logId: string,
  agentId: string,
): Promise<void> {
  const existing = await getVoiceLogForAgent(logId, agentId);
  if (!existing || existing.status !== "processing" || existing.client_id) return;

  await updateVoiceLogForAgent(logId, agentId, {
    status: "pending",
    appliedAction: null,
  });
}

export async function updateVoiceLogForAgent(
  logId: string,
  agentId: string,
  patch: {
    status?: VoiceLogStatus;
    clientId?: string | null;
    appliedAction?: string | null;
    parsed_json_data?: Record<string, unknown>;
    transcript?: string;
  },
): Promise<VoiceCrmLog | null> {
  const existing = await getVoiceLogForAgent(logId, agentId);
  if (!existing) return null;

  const supabase = createSupabaseAdmin();
  const updateBody: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (patch.status) updateBody.status = patch.status;
  if (patch.clientId !== undefined) updateBody.client_id = patch.clientId;
  if (patch.appliedAction !== undefined) updateBody.applied_action = patch.appliedAction;
  if (patch.transcript !== undefined) updateBody.transcript = patch.transcript;
  if (patch.parsed_json_data) {
    updateBody.parsed_json_data = {
      ...patch.parsed_json_data,
      [VOICE_LOG_AGENT_ID_KEY]: agentId,
    };
  }

  const { data, error } = await supabase
    .from("voice_crm_logs")
    .update(updateBody)
    .eq("id", logId)
    .select("*")
    .single();

  if (error || !data) return null;

  return normalizeVoiceCrmLog(data as VoiceLogRow);
}

export async function deleteVoiceLogForAgent(
  logId: string,
  agentId: string,
): Promise<boolean> {
  const existing = await getVoiceLogForAgent(logId, agentId);
  if (!existing) return false;

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("voice_crm_logs").delete().eq("id", logId);

  return !error;
}

// Re-export transcript idempotency helper used by voice route
export { buildVoiceIdempotencyKey } from "./voice-log-idempotency";
