import Groq from "groq-sdk";
import { NextResponse } from "next/server";

import {
  getGroqApiKey,
  isGroqConfigured,
  logGroqConfigDebug,
} from "@/lib/ai/groq-env";
import { normalizeVoiceCrmLog } from "@/lib/crm-logs";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { createSupabaseAdmin } from "@/lib/supabase";
import type { CrmVoicePayload } from "@/lib/types/crm";
import { voiceLogPayloadForAgent } from "@/lib/voice-crm/agent-scope";
import { getVoiceCrmConfigStatus } from "@/lib/voice-crm/config";
import {
  mapGroqProviderError,
  mapVoiceUserError,
  VOICE_ERROR_MESSAGES,
  voiceErrorBody,
  type VoiceErrorCode,
} from "@/lib/voice-crm/errors";

const WHISPER_MODEL = "whisper-large-v3";
const LLM_MODEL = "llama-3.1-8b-instant";
const MIN_AUDIO_BYTES = 800;

export const runtime = "nodejs";

const SYSTEM_PROMPT =
  'Sen bir emlak CRM asistanısın. Kullanıcının sesli notunu alıp SADECE ve SADECE şu JSON objesine dönüştür: { "musteri_adi": "", "butce": "", "lokasyon": "", "mulk_tipi": "", "notlar": "" }. Başka hiçbir açıklama, markdown veya ekstra metin kullanma.';

function jsonError(code: VoiceErrorCode, status: number) {
  const { body, status: httpStatus } = voiceErrorBody(code, status);
  return NextResponse.json(body, { status: httpStatus });
}

function getGroqClient(): Groq {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("AI provider is not configured.");
  }
  return new Groq({ apiKey });
}

function parseCrmPayload(content: string): CrmVoicePayload {
  const parsed: unknown = JSON.parse(content);

  if (!parsed || typeof parsed !== "object") {
    throw new Error("LLM yanıtı geçerli bir JSON nesnesi değil.");
  }

  const record = parsed as Record<string, unknown>;

  return {
    musteri_adi: String(record.musteri_adi ?? ""),
    butce: String(record.butce ?? ""),
    lokasyon: String(record.lokasyon ?? ""),
    mulk_tipi: String(record.mulk_tipi ?? ""),
    notlar: String(record.notlar ?? ""),
  };
}

async function saveVoiceCrmLog(agentId: string, crmData: CrmVoicePayload) {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("voice_crm_logs")
    .insert({
      parsed_json_data: voiceLogPayloadForAgent(agentId, crmData),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Supabase kayıt hatası: ${error.message}`);
  }

  return normalizeVoiceCrmLog(data as Record<string, unknown>);
}

export async function POST(request: Request) {
  try {
    const agent = await requireCurrentAgent();
    const config = getVoiceCrmConfigStatus();

    if (!config.groqReady) {
      logGroqConfigDebug("POST /api/voice");
      return jsonError("config_groq", 503);
    }

    if (!config.storageReady) {
      return jsonError("config_storage", 503);
    }

    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File)) {
      return jsonError("validation", 400);
    }

    if (audio.size === 0 || audio.size < MIN_AUDIO_BYTES) {
      return NextResponse.json(
        {
          error: VOICE_ERROR_MESSAGES.validation,
          code: "validation" as const,
        },
        { status: 400 },
      );
    }

    const groq = getGroqClient();

    let transcription;
    try {
      transcription = await groq.audio.transcriptions.create({
        file: audio,
        model: WHISPER_MODEL,
        language: "tr",
      });
    } catch (error) {
      console.error("[POST /api/voice] Groq transcription", error);
      const message =
        error instanceof Error ? error.message : "Groq transcription failed";
      return NextResponse.json(
        {
          error: mapGroqProviderError(message),
          code: "provider" as const,
        },
        { status: 502 },
      );
    }

    const transcript = transcription.text.trim();

    if (!transcript) {
      return NextResponse.json(
        {
          error: VOICE_ERROR_MESSAGES.empty_transcript,
          code: "validation" as const,
        },
        { status: 422 },
      );
    }

    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: LLM_MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: transcript },
        ],
      });
    } catch (error) {
      console.error("[POST /api/voice] Groq completion", error);
      const message =
        error instanceof Error ? error.message : "Groq completion failed";
      return NextResponse.json(
        {
          error: mapGroqProviderError(message),
          code: "provider" as const,
        },
        { status: 502 },
      );
    }

    const rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
      return jsonError("provider", 502);
    }

    let crmData: CrmVoicePayload;
    try {
      crmData = parseCrmPayload(rawContent);
    } catch (error) {
      console.error("[POST /api/voice] CRM JSON parse", error);
      return jsonError("provider", 502);
    }

    const log = await saveVoiceCrmLog(agent.id, crmData);

    return NextResponse.json({
      transcript,
      data: crmData,
      log,
    });
  } catch (error) {
    console.error("[POST /api/voice]", error);

    if (error instanceof Error && error.message.includes("Oturum")) {
      return NextResponse.json(
        { error: error.message, code: "auth" as const },
        { status: 401 },
      );
    }

    const rawMessage =
      error instanceof Error
        ? error.message
        : "Ses işleme sırasında beklenmeyen bir hata oluştu.";

    const configMapped = mapVoiceUserError(rawMessage);
    const lower = rawMessage.toLowerCase();
    const code: VoiceErrorCode =
      !isGroqConfigured() ||
      lower.includes("ai provider is not configured") ||
      lower.includes("provider is not configured")
        ? "config_groq"
        : rawMessage.includes("SUPABASE") ||
            rawMessage.includes("NEXT_PUBLIC_SUPABASE")
          ? "config_storage"
          : "internal";

    const status =
      code === "config_groq" || code === "config_storage" ? 503 : 500;

    return NextResponse.json({ error: configMapped, code }, { status });
  }
}
