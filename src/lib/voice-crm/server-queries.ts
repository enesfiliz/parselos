import "server-only";

import { requireCurrentAgent } from "@/lib/auth/agent";
import { normalizeVoiceCrmLogs } from "@/lib/crm-logs";
import { createSupabaseAdmin } from "@/lib/supabase";
import type { VoiceCrmLog } from "@/lib/types/crm";

import { isVoiceLogOwnedByAgent, VOICE_LOG_AGENT_ID_KEY } from "./agent-scope";
import { mapVoiceLoadError } from "./errors";
import { getVoiceCrmConfigStatus } from "./config";

export type VoiceLogsLoadResult = {
  logs: VoiceCrmLog[];
  error: string | null;
};

export async function loadVoiceLogsForCurrentAgent(): Promise<VoiceLogsLoadResult> {
  const agent = await requireCurrentAgent();
  const config = getVoiceCrmConfigStatus();

  if (!config.storageReady) {
    return {
      logs: [],
      error: mapVoiceLoadError("SUPABASE_SERVICE_ROLE_KEY ortam değişkeni tanımlı değil."),
    };
  }

  try {
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("voice_crm_logs")
      .select("*")
      .contains("parsed_json_data", { [VOICE_LOG_AGENT_ID_KEY]: agent.id })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[voice-crm/load]", error.message);
      return {
        logs: [],
        error: mapVoiceLoadError(error.message),
      };
    }

    const rows = ((data ?? []) as Record<string, unknown>[]).filter((row) =>
      isVoiceLogOwnedByAgent(row.parsed_json_data, agent.id),
    );

    return {
      logs: normalizeVoiceCrmLogs(rows),
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bilinmeyen yükleme hatası";
    console.error("[voice-crm/load]", error);
    return {
      logs: [],
      error: mapVoiceLoadError(message),
    };
  }
}
