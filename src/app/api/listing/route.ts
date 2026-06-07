import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-3.5-flash";

const LISTING_PROMPT = `Sen ParselOS platformunun elit, keskin ve sonuç odaklı gayrimenkul metin yazarısın.

Kesin Kurallar:
1) Asla "Merhaba", "Size nasıl yardımcı olabilirim", "İşte ilanınız" gibi robotik giriş ve çıkış cümleleri KULLANMA.
2) Cümlelerin çok kısa, vurucu ve ikna edici olsun.
3) Uzun paragraflar yazma; özellikleri her zaman kısa madde işaretleriyle (bullet points) belirt.
4) Çıktıların gayrimenkul diline hakim, profesyonel bir broker ağzından çıkmış gibi net olsun.
5) Yalnızca doğrudan kullanılabilir, kopyala-yapıştır yapmaya hazır nihai metni ver.

Çıktı formatı: Tek satır SEO başlığı, ardından yalnızca madde işaretli gövde. Açıklama, selamlama veya meta yorum ekleme.`;

interface ListingRequestBody {
  konum?: string;
  odaSayisi?: string;
  metrekare?: string;
  fiyat?: string;
  ekstraOzellikler?: string;
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY ortam değişkeni tanımlı değil.");
  }

  return new GoogleGenerativeAI(apiKey);
}

function buildPropertyBrief(body: ListingRequestBody): string {
  return [
    `Konum: ${body.konum?.trim() || "Belirtilmedi"}`,
    `Oda Sayısı: ${body.odaSayisi?.trim() || "Belirtilmedi"}`,
    `Metrekare: ${body.metrekare?.trim() || "Belirtilmedi"}`,
    `Fiyat: ${body.fiyat?.trim() || "Belirtilmedi"}`,
    `Ekstra Özellikler: ${body.ekstraOzellikler?.trim() || "Belirtilmedi"}`,
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ListingRequestBody;

    const hasInput = [
      body.konum,
      body.odaSayisi,
      body.metrekare,
      body.fiyat,
      body.ekstraOzellikler,
    ].some((value) => typeof value === "string" && value.trim().length > 0);

    if (!hasInput) {
      return NextResponse.json(
        { error: "En az bir gayrimenkul özelliği girilmelidir." },
        { status: 400 },
      );
    }

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const result = await model.generateContent([
      { text: LISTING_PROMPT },
      {
        text: `Bu özelliklere göre yalnızca nihai ilan metnini üret (başlık + madde işaretleri):\n\n${buildPropertyBrief(body)}`,
      },
    ]);

    const listing = result.response.text()?.trim();

    if (!listing) {
      return NextResponse.json(
        { error: "Gemini ilan metni üretemedi." },
        { status: 502 },
      );
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error("[POST /api/listing]", error);

    const message =
      error instanceof Error
        ? error.message
        : "İlan metni oluşturulurken beklenmeyen bir hata oluştu.";

    const status = message.includes("GEMINI_API_KEY")
      ? 500
      : message.includes("Gemini")
        ? 502
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
