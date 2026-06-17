export type VoiceErrorCode =
  | "config_groq"
  | "config_storage"
  | "validation"
  | "provider"
  | "auth"
  | "internal";

export const VOICE_ERROR_MESSAGES = {
  config_groq: "Yapay zekâ hizmeti şu anda kullanılamıyor.",
  config_storage: "Kayıt geçmişi şu anda görüntülenemiyor.",
  validation: "Gönderilen ses kaydı geçersiz veya çok kısa.",
  provider: "Ses tanıma servisi şu an yanıt vermiyor. Biraz sonra tekrar deneyin.",
  auth: "Oturum doğrulanamadı.",
  internal: "Sesli CRM işlemi tamamlanamadı.",
  load: "Kayıtlar yüklenemedi.",
  empty_transcript: "Ses kaydından metin çıkarılamadı. Daha net konuşmayı deneyin.",
  table_missing: "Kayıt geçmişi şu anda görüntülenemiyor.",
} as const;

export function voiceErrorBody(
  code: VoiceErrorCode,
  status: number,
): { body: { error: string; code: VoiceErrorCode }; status: number } {
  return {
    body: { error: VOICE_ERROR_MESSAGES[code], code },
    status,
  };
}

export function mapVoiceConfigError(message: string): string | null {
  const lower = message.toLowerCase();

  if (
    lower.includes("ai provider is not configured") ||
    lower.includes("provider is not configured") ||
    lower.includes("sağlayıcısı yapılandırılmamış")
  ) {
    return VOICE_ERROR_MESSAGES.config_groq;
  }

  if (
    message.includes("NEXT_PUBLIC_SUPABASE_URL") ||
    message.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    message.includes("SUPABASE_SERVICE_ROLE_KEY")
  ) {
    return VOICE_ERROR_MESSAGES.config_storage;
  }

  if (
    lower.includes("voice_crm_logs") &&
    (lower.includes("does not exist") ||
      lower.includes("could not find the table") ||
      lower.includes("schema cache"))
  ) {
    return VOICE_ERROR_MESSAGES.table_missing;
  }

  return null;
}

export function mapVoiceUserError(message: string): string {
  return mapVoiceConfigError(message) ?? VOICE_ERROR_MESSAGES.internal;
}

export function mapVoiceLoadError(message: string): string {
  const mapped = mapVoiceConfigError(message);
  if (mapped) return mapped;
  return VOICE_ERROR_MESSAGES.load;
}

export function mapGroqProviderError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("rate limit") ||
    lower.includes("timeout") ||
    lower.includes("503") ||
    lower.includes("502") ||
    lower.includes("overloaded")
  ) {
    return VOICE_ERROR_MESSAGES.provider;
  }
  return VOICE_ERROR_MESSAGES.provider;
}
