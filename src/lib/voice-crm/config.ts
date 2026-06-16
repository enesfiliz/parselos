import "server-only";

import { isGroqConfigured } from "@/lib/ai/groq-env";
import type { VoiceCrmConfigStatus } from "@/lib/types/crm";

export function getVoiceCrmConfigStatus(): VoiceCrmConfigStatus {
  return {
    groqReady: isGroqConfigured(),
    storageReady: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() &&
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    ),
  };
}
