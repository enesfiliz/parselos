import Groq from "groq-sdk";
import { NextResponse } from "next/server";

import {
  getGroqApiKey,
  isGroqConfigured,
  logGroqConfigDebug,
} from "@/lib/ai/groq-env";
import { requireCurrentAgent } from "@/lib/auth/agent";
import type { CrmVoicePayload } from "@/lib/types/crm";
import {
  confidenceLabel,
  findVoiceClientCandidates,
} from "@/lib/voice-crm/client-matching";
import { getVoiceCrmConfigStatus } from "@/lib/voice-crm/config";
import {
  buildVoiceIdempotencyKey,
  findVoiceLogByIdempotencyKey,
  getVoiceLogForAgent,
  insertPendingVoiceLog,
  updateVoiceLogForAgent,
} from "@/lib/voice-crm/voice-log-store";
import {
  mergeVoicePayload,
  mergeVoiceTranscript,
} from "@/lib/voice-crm/merge-voice-payload";
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
  'Sen bir emlak CRM asistanısın. Kullanıcının sesli notunu alıp SADECE ve SADECE şu JSON objesine dönüştür: { "musteri_adi": "", "telefon": "", "eposta": "", "butce": "", "lokasyon": "", "mulk_tipi": "", "niyet": "", "aciliyet": "", "takip_tarihi": "", "notlar": "" }. niyet: satılık/kiralık/arayış/satış niyeti. aciliyet: düşük/orta/yüksek. Başka hiçbir açıklama, markdown veya ekstra metin kullanma.';

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
    telefon: record.telefon != null ? String(record.telefon) : undefined,
    eposta: record.eposta != null ? String(record.eposta) : undefined,
    niyet: record.niyet != null ? String(record.niyet) : undefined,
    aciliyet: record.aciliyet != null ? String(record.aciliyet) : undefined,
    takip_tarihi:
      record.takip_tarihi != null ? String(record.takip_tarihi) : undefined,
  };
}

async function savePendingVoiceLog(
  agentId: string,
  transcript: string,
  crmData: CrmVoicePayload,
  audioSize: number,
) {
  const idempotencyKey = buildVoiceIdempotencyKey(agentId, transcript, audioSize);
  const existing = await findVoiceLogByIdempotencyKey(agentId, idempotencyKey);
  if (existing) {
    return existing;
  }

  return insertPendingVoiceLog({
    agentId,
    transcript,
    payload: crmData,
    idempotencyKey,
  });
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
    const appendToLogId = formData.get("appendToLogId");

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

    if (typeof appendToLogId === "string" && appendToLogId.trim()) {
      const existing = await getVoiceLogForAgent(appendToLogId.trim(), agent.id);
      if (!existing) {
        return NextResponse.json(
          { error: "Sesli not bulunamadı." },
          { status: 404 },
        );
      }

      const mergedPayload = mergeVoicePayload(existing.parsed_json_data, crmData);
      const mergedTranscript = mergeVoiceTranscript(existing.transcript, transcript);
      const log = await updateVoiceLogForAgent(appendToLogId.trim(), agent.id, {
        parsed_json_data: mergedPayload as unknown as Record<string, unknown>,
        transcript: mergedTranscript,
        status:
          existing.status === "archived" || existing.status === "dismissed"
            ? "pending"
            : existing.status ?? "pending",
      });

      if (!log) {
        return jsonError("internal", 500);
      }

      const candidates = await findVoiceClientCandidates(agent.id, mergedPayload);
      return NextResponse.json({
        transcript: mergedTranscript,
        data: mergedPayload,
        log,
        candidates: candidates.map((candidate) => ({
          ...candidate,
          confidenceLabel: confidenceLabel(candidate.confidence),
        })),
        appended: true,
      });
    }

    const log = await savePendingVoiceLog(agent.id, transcript, crmData, audio.size);
    const candidates = await findVoiceClientCandidates(agent.id, crmData);

    return NextResponse.json({
      transcript,
      data: crmData,
      log,
      candidates: candidates.map((candidate) => ({
        ...candidate,
        confidenceLabel: confidenceLabel(candidate.confidence),
      })),
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
