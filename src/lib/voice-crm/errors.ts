export function mapVoiceConfigError(message: string): string | null {
  const lower = message.toLowerCase();

  if (
    message.includes("GROQ_API_KEY") ||
    (lower.includes("groq") && lower.includes("tanımlı değil"))
  ) {
    return "Sesli CRM sağlayıcısı yapılandırılmamış.";
  }

  if (
    message.includes("NEXT_PUBLIC_SUPABASE_URL") ||
    message.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    message.includes("SUPABASE_SERVICE_ROLE_KEY")
  ) {
    return "Sesli CRM kayıt servisi yapılandırılmamış.";
  }

  if (
    lower.includes("voice_crm_logs") &&
    (lower.includes("does not exist") ||
      lower.includes("could not find the table") ||
      lower.includes("schema cache"))
  ) {
    return "Sesli CRM kayıt tablosu henüz kurulmamış.";
  }

  return null;
}

export function mapVoiceUserError(message: string): string {
  return mapVoiceConfigError(message) ?? "Sesli CRM işlemi tamamlanamadı.";
}

export function mapVoiceLoadError(message: string): string {
  const mapped = mapVoiceConfigError(message);
  if (mapped) return mapped;
  return "Kayıtlar yüklenemedi.";
}
