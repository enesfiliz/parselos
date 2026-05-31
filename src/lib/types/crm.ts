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
}

export interface VoiceApiError {
  error: string;
}

export interface VoiceCrmLog {
  id: string;
  parsed_json_data: CrmVoicePayload;
  created_at: string;
}
