export interface CrmVoicePayload {
  musteri_adi: string;
  butce: string;
  lokasyon: string;
  mulk_tipi: string;
  notlar: string;
}

export interface VoiceCrmLog {
  id: string;
  parsed_json_data: CrmVoicePayload;
  created_at: string;
  updated_at?: string | null;
  transcript?: string | null;
  status?: VoiceLogStatus;
  client_id?: string | null;
  applied_action?: string | null;
}

export type VoiceLogStatus =
  | "pending"
  | "processing"
  | "processed"
  | "archived"
  | "dismissed";

export interface VoiceApiSuccess {
  transcript: string;
  data: CrmVoicePayload;
  log?: VoiceCrmLog;
  candidates?: VoiceClientCandidateResponse[];
}

export type VoiceClientCandidateResponse = {
  id: string;
  adSoyad: string;
  telefon: string | null;
  butce: string | null;
  mulkTipi: string | null;
  confidence: "strong" | "possible" | "new";
  confidenceLabel: string;
  reason: string;
};

export interface VoiceApiError {
  error: string;
  code?:
    | "config_groq"
    | "config_storage"
    | "validation"
    | "provider"
    | "auth"
    | "internal";
}

export type VoiceCrmConfigStatus = {
  groqReady: boolean;
  storageReady: boolean;
};

export function isVoiceCrmOperational(status: VoiceCrmConfigStatus) {
  return status.groqReady && status.storageReady;
}
