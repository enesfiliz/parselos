import "server-only";

export const GROQ_PROVIDER_NAME = "groq" as const;

export const AI_PROVIDER_MISSING_MESSAGE = "AI sağlayıcısı yapılandırılmamış." as const;

/** Runtime Groq key — trimmed; never log or return to clients. */
export function getGroqApiKey(): string | null {
  const key = process.env.GROQ_API_KEY?.trim();
  return key ? key : null;
}

export function isGroqConfigured(): boolean {
  return Boolean(getGroqApiKey());
}

export type GroqConfigDebugInfo = {
  providerName: typeof GROQ_PROVIDER_NAME;
  hasGroqKey: boolean;
  keyPresent: "present" | "missing";
  routeName: string;
};

/** Safe server-side debug — never includes secret values or lengths. */
export function logGroqConfigDebug(routeName: string): GroqConfigDebugInfo {
  const hasGroqKey = isGroqConfigured();
  const info: GroqConfigDebugInfo = {
    providerName: GROQ_PROVIDER_NAME,
    hasGroqKey,
    keyPresent: hasGroqKey ? "present" : "missing",
    routeName,
  };
  console.info(`[${routeName}] AI provider config`, info);
  return info;
}
