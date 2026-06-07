import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const GEMINI_MODEL = "gemini-1.5-flash";

const SYSTEM_PROMPT =
  "Sen Seviye 5 lisanslı, analitik bir gayrimenkul yatırım uzmanısın. Ekli tapu veya ekspertiz görselini incele. Sadece metinleri okumakla kalma; bölgenin niteliğine (arsa/tarla vb.) ve hisse durumuna bakarak derin bir yatırım analizi yap.";

const USER_PROMPT = `Cevabı sadece geçerli JSON olarak döndür. Markdown, açıklama veya kod bloğu kullanma.
JSON alanları:
{
  "extractedData": {
    "il": "",
    "ilçe": "",
    "mahalle": "",
    "ada": "",
    "parsel": "",
    "nitelik": "",
    "yuzolcumu": ""
  },
  "riskAnalysis": ["..."],
  "advantages": ["..."],
  "aiSummary": "..."
}
Eksik okuyamadığın alanlar için boş string kullan. Risk ve avantajları profesyonel, kısa ve karar destek odaklı yaz.`;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

type DeedAnalysis = {
  extractedData: {
    il: string;
    ilçe: string;
    mahalle: string;
    ada: string;
    parsel: string;
    nitelik: string;
    yuzolcumu: string;
  };
  riskAnalysis: string[];
  advantages: string[];
  aiSummary: string;
};

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY veya GOOGLE_API_KEY tanımlı değil.");
  }

  return apiKey;
}

function resolveMimeType(file: File): string | null {
  const mime = file.type.toLowerCase();

  if (ALLOWED_MIME_TYPES.has(mime)) {
    return mime === "image/jpg" ? "image/jpeg" : mime;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return null;
  }
}

async function fileToInlineData(file: File) {
  const mimeType = resolveMimeType(file);

  if (!mimeType) {
    throw new Error("Desteklenmeyen görsel formatı. JPG, PNG veya WEBP yükleyin.");
  }

  return {
    mimeType,
    data: Buffer.from(await file.arrayBuffer()).toString("base64"),
  };
}

function extractJsonContent(content: string) {
  const trimmed = content.trim();

  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  return trimmed;
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function normalizePayload(payload: unknown): DeedAnalysis {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const extracted =
    record.extractedData && typeof record.extractedData === "object"
      ? (record.extractedData as Record<string, unknown>)
      : {};

  return {
    extractedData: {
      il: String(extracted.il ?? ""),
      ilçe: String(extracted.ilçe ?? extracted.ilce ?? ""),
      mahalle: String(extracted.mahalle ?? ""),
      ada: String(extracted.ada ?? ""),
      parsel: String(extracted.parsel ?? ""),
      nitelik: String(extracted.nitelik ?? ""),
      yuzolcumu: String(extracted.yuzolcumu ?? extracted.yüzölçümü ?? ""),
    },
    riskAnalysis: stringArray(record.riskAnalysis),
    advantages: stringArray(record.advantages),
    aiSummary: String(record.aiSummary ?? ""),
  };
}

function parseAnalysis(content: string): DeedAnalysis {
  return normalizePayload(JSON.parse(extractJsonContent(content)));
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        { error: "Geçerli bir görsel gönderilmedi. 'image' alanı zorunludur." },
        { status: 400 },
      );
    }

    const inlineData = await fileToInlineData(image);
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: USER_PROMPT },
            { inlineData },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.25,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedData: {
              type: Type.OBJECT,
              properties: {
                il: { type: Type.STRING },
                ilçe: { type: Type.STRING },
                mahalle: { type: Type.STRING },
                ada: { type: Type.STRING },
                parsel: { type: Type.STRING },
                nitelik: { type: Type.STRING },
                yuzolcumu: { type: Type.STRING },
              },
              required: ["il", "ilçe", "mahalle", "ada", "parsel", "nitelik", "yuzolcumu"],
            },
            riskAnalysis: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            advantages: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            aiSummary: { type: Type.STRING },
          },
          required: ["extractedData", "riskAnalysis", "advantages", "aiSummary"],
        },
      },
    });

    const text = response.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Gemini analiz yanıtı üretemedi." },
        { status: 502 },
      );
    }

    return NextResponse.json({ data: parseAnalysis(text) });
  } catch (error) {
    console.error("[POST /api/analyze-deed]", error);

    const message =
      error instanceof Error
        ? error.message
        : "TapuAI analizi sırasında beklenmeyen bir hata oluştu.";

    const status = message.includes("GEMINI") || message.includes("GOOGLE")
      ? 500
      : message.includes("Desteklenmeyen")
        ? 400
        : message.includes("JSON")
          ? 502
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
