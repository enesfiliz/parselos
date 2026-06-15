import Groq from "groq-sdk";
import { NextResponse } from "next/server";

import { requireCurrentAgent } from "@/lib/auth/agent";
import { createSupabaseAdmin } from "@/lib/supabase";
import type { CrmVoicePayload } from "@/lib/types/crm";
import { voiceLogPayloadForAgent } from "@/lib/voice-crm/agent-scope";
import { mapVoiceUserError } from "@/lib/voice-crm/errors";

const WHISPER_MODEL = "whisper-large-v3";
const LLM_MODEL = "llama-3.1-8b-instant";

const SYSTEM_PROMPT =
  'Sen bir emlak CRM asistanısın. Kullanıcının sesli notunu alıp SADECE ve SADECE şu JSON objesine dönüştür: { "musteri_adi": "", "butce": "", "lokasyon": "", "mulk_tipi": "", "notlar": "" }. Başka hiçbir açıklama, markdown veya ekstra metin kullanma.';

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY ortam değişkeni tanımlı değil.");
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

async function saveVoiceCrmLog(
  agentId: string,
  crmData: CrmVoicePayload,
): Promise<void> {
  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("voice_crm_logs").insert({
    parsed_json_data: voiceLogPayloadForAgent(agentId, crmData),
  });

  if (error) {
    throw new Error(`Supabase kayıt hatası: ${error.message}`);
  }
}

export async function POST(request: Request) {
  try {
    const agent = await requireCurrentAgent();

    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!(audio instanceof File) || audio.size === 0) {
      return NextResponse.json(
        { error: "Geçerli bir ses dosyası gönderilmedi. 'audio' alanı zorunludur." },
        { status: 400 },
      );
    }

    const groq = getGroqClient();

    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: WHISPER_MODEL,
      language: "tr",
    });

    const transcript = transcription.text.trim();

    if (!transcript) {
      return NextResponse.json(
        { error: "Ses kaydından metin çıkarılamadı." },
        { status: 422 },
      );
    }

    const completion = await groq.chat.completions.create({
      model: LLM_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: transcript },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        { error: "LLM yanıt üretemedi." },
        { status: 502 },
      );
    }

    const crmData = parseCrmPayload(rawContent);

    await saveVoiceCrmLog(agent.id, crmData);

    return NextResponse.json({
      transcript,
      data: crmData,
    });
  } catch (error) {
    console.error("[POST /api/voice]", error);

    if (error instanceof Error && error.message.includes("Oturum")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const rawMessage =
      error instanceof Error
        ? error.message
        : "Ses işleme sırasında beklenmeyen bir hata oluştu.";

    const message = mapVoiceUserError(rawMessage);
    const status = rawMessage.includes("GROQ_API_KEY") ||
      rawMessage.includes("SUPABASE") ||
      rawMessage.includes("NEXT_PUBLIC_SUPABASE")
      ? 503
      : rawMessage.includes("JSON")
        ? 502
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
