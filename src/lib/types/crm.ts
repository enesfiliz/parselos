export interface CrmVoicePayload {
  musteri_adi: string;
  butce: string;
  lokasyon: string;
  mulk_tipi: string;
  notlar: string;
}

export interface VoiceApiSuccess {
  transcript: string;
  data: CrmVoicePayload;
  log?: VoiceCrmLog;
}

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

export interface VoiceCrmLog {
  id: string;
  parsed_json_data: CrmVoicePayload;
  created_at: string;
}

export type VoiceCrmConfigStatus = {
  groqReady: boolean;
  storageReady: boolean;
};

export function isVoiceCrmOperational(status: VoiceCrmConfigStatus) {
  return status.groqReady && status.storageReady;
}
