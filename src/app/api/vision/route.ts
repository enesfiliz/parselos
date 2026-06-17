import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-3.5-flash";

const VISION_PROMPT =
  'Sen kıdemli bir gayrimenkul avukatısın. Belgeyi oku ve SADECE şu JSON formatında yanıt ver: { "belge_turu": "", "sahip_bilgisi": "", "onemli_detaylar": "", "risk_analizi": "" }. Kod bloğu kullanma.';

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

interface TapuVisionSonucu {
  belge_turu: string;
  sahip_bilgisi: string;
  onemli_detaylar: string;
  risk_analizi: string;
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY ortam değişkeni tanımlı değil.");
  }

  return new GoogleGenerativeAI(apiKey);
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

async function fileToInlineImage(file: File): Promise<{
  mimeType: string;
  data: string;
}> {
  const mimeType = resolveMimeType(file);

  if (!mimeType) {
    throw new Error("Desteklenmeyen görsel formatı. jpg, png veya webp yükleyin.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const data = buffer.toString("base64");

  return { mimeType, data };
}

function extractJsonContent(content: string): string {
  const trimmed = content.trim();

  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }

  return trimmed;
}

function parseVisionPayload(content: string): TapuVisionSonucu {
  const parsed: unknown = JSON.parse(extractJsonContent(content));

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Gemini geçerli bir JSON nesnesi döndürmedi.");
  }

  const record = parsed as Record<string, unknown>;

  return {
    belge_turu: String(record.belge_turu ?? ""),
    sahip_bilgisi: String(record.sahip_bilgisi ?? ""),
    onemli_detaylar: String(record.onemli_detaylar ?? ""),
    risk_analizi: String(record.risk_analizi ?? ""),
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        { error: "Geçerli bir görsel dosyası gönderilmedi. 'image' alanı zorunludur." },
        { status: 400 },
      );
    }

    const mimeType = resolveMimeType(image);

    if (!mimeType) {
      return NextResponse.json(
        { error: "Desteklenmeyen görsel formatı. jpg, png veya webp yükleyin." },
        { status: 400 },
      );
    }

    const { mimeType: inlineMimeType, data } = await fileToInlineImage(image);
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const result = await model.generateContent([
      { text: VISION_PROMPT },
      {
        inlineData: {
          mimeType: inlineMimeType,
          data,
        },
      },
    ]);

    const rawContent = result.response.text()?.trim();

    if (!rawContent) {
      return NextResponse.json(
        { error: "Belge analizi tamamlanamadı." },
        { status: 502 },
      );
    }

    const parsedData = parseVisionPayload(rawContent);

    return NextResponse.json({ data: parsedData });
  } catch (error) {
    console.error("[POST /api/vision]", error);

    const message =
      error instanceof Error
        ? error.message
        : "Görsel analizi sırasında beklenmeyen bir hata oluştu.";

    const status = message.includes("GEMINI_API_KEY")
      ? 500
      : message.includes("JSON") || message.includes("Gemini")
        ? 502
        : message.includes("Desteklenmeyen")
          ? 400
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
