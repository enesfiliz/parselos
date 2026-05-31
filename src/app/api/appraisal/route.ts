import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

import type {
  AppraisalReport,
  EmsalKaydi,
  KarlilikOrani,
  RadarMetrigi,
} from "@/lib/types/appraisal";

const GEMINI_MODEL = "gemini-3.5-flash";

const APPRAISAL_PROMPT = `Sen SPK lisanslı bir gayrimenkul değerleme uzmanı ve uluslararası CMA analistisin. Verilen mülk bilgilerine göre arayüzdeki grafikleri, uydu haritasını, emsal tablolarını ve uzun formatlı metin bölümlerini besleyecek saf JSON üret.

SADECE aşağıdaki JSON iskeletinde yanıt ver. Markdown, kod bloğu veya açıklama ekleme:
{
  "lokasyon": {"enlem": 40.015, "boylam": 30.182},
  "genel_skor": 88,
  "fiyat_analizi": {"tahmini_deger": "12.450.000 TL", "ortalama_m2_fiyat": "85.000 TL/m²"},
  "radar_metrikleri": [
    {"kategori": "Ulaşım", "puan": 85},
    {"kategori": "Ticari Potansiyel", "puan": 92},
    {"kategori": "Altyapı", "puan": 75},
    {"kategori": "Gelişim Beklentisi", "puan": 90}
  ],
  "emsal_analizi": [
    {"rakip_mulk": "Parsel A - 500m²", "fiyat": "11.800.000 TL", "fark": "+%5"},
    {"rakip_mulk": "Parsel B - 450m²", "fiyat": "12.700.000 TL", "fark": "-%2"},
    {"rakip_mulk": "Parsel C - 600m²", "fiyat": "12.400.000 TL", "fark": "%0"}
  ],
  "karlilik_oranlari": [
    {"baslik": "Kira Çarpanı", "deger": "16 Yıl"},
    {"baslik": "Yıllık Amortisman", "deger": "%6.2"}
  ],
  "uzman_gorusu": "Tam 3 cümle. SPK lisanslı değerleme uzmanı diliyle SWOT içeren profesyonel özet.",
  "detayli_bolge_analizi": "En az 3 paragraf. Paragraflar arasında \\n\\n kullan. Demografik yapı, ticari dinamikler, ulaşım/altyapı ve planlanan projeleri analiz et.",
  "yatirim_ve_risk_raporu": "En az 2 paragraf. Paragraflar arasında \\n\\n kullan. Güçlü/zayıf yönler, fırsatlar, makro ve mikro riskleri detaylandır.",
  "fiyat_analizi_gerekcesi": "En az 2 paragraf. Paragraflar arasında \\n\\n kullan. Tahmini değerin emsallerle tutarlı gerekçesini, m² birim fiyat mantığını ve ayarlamaları açıkla."
}

Kurallar:
- TUTARLILIK: Aynı il, ilçe, mahalle, ada, parsel, brüt m² ve net m² girildiğinde tahmini_deger, ortalama_m2_fiyat, genel_skor ve emsal fiyatları her seferinde aynı olmalı. Fiyatı brüt m² × bölgesel birim fiyat × parsel/özellik katsayısı formülüyle deterministik hesapla; rastgele sapma üretme.
- lokasyon: il/ilçe/mahalleye göre gerçekçi WGS84 koordinatları (Türkiye)
- fiyat_analizi: Türk Lirası, binlik ayraçlı (örn: "12.450.000 TL")
- radar_metrikleri: tam 4 kategori, puan 0-100
- emsal_analizi: tam 3 rakip, fark formatı "+%5", "-%2" veya "%0"
- karlilik_oranlari: tam 2 kayıt
- detayli_bolge_analizi: minimum 3 paragraf, her paragraf en az 4 cümle, toplam en az 600 kelime
- yatirim_ve_risk_raporu: minimum 2 paragraf, her paragraf en az 4 cümle, toplam en az 350 kelime
- fiyat_analizi_gerekcesi: minimum 2 paragraf, emsal tablosundaki rakamlarla tutarlı, toplam en az 350 kelime`;

interface AppraisalRequestBody {
  il?: string;
  ilce?: string;
  mahalle?: string;
  ada?: string;
  parsel?: string;
  brutMetrekare?: string;
  netMetrekare?: string;
  ozellikler?: string;
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY ortam değişkeni tanımlı değil.");
  }

  return new GoogleGenerativeAI(apiKey);
}

function buildPropertyBrief(body: AppraisalRequestBody): string {
  return [
    `İl: ${body.il?.trim() || "Belirtilmedi"}`,
    `İlçe: ${body.ilce?.trim() || "Belirtilmedi"}`,
    `Mahalle: ${body.mahalle?.trim() || "Belirtilmedi"}`,
    `Ada: ${body.ada?.trim() || "Belirtilmedi"}`,
    `Parsel: ${body.parsel?.trim() || "Belirtilmedi"}`,
    `Brüt Alan (m²): ${body.brutMetrekare?.trim() || "Belirtilmedi"}`,
    `Net Alan (m²): ${body.netMetrekare?.trim() || "Belirtilmedi"}`,
    `Özellikler: ${body.ozellikler?.trim() || "Belirtilmedi"}`,
  ].join("\n");
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

function parseRadarMetrikleri(raw: unknown): RadarMetrigi[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        kategori: String(row.kategori ?? ""),
        puan: Math.min(100, Math.max(0, Number(row.puan) || 0)),
      };
    })
    .filter((item) => item.kategori);
}

function parseEmsalAnalizi(raw: unknown): EmsalKaydi[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        rakip_mulk: String(row.rakip_mulk ?? ""),
        fiyat: String(row.fiyat ?? ""),
        fark: String(row.fark ?? ""),
      };
    })
    .filter((item) => item.rakip_mulk);
}

function parseKarlilikOranlari(raw: unknown): KarlilikOrani[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        baslik: String(row.baslik ?? ""),
        deger: String(row.deger ?? ""),
      };
    })
    .filter((item) => item.baslik);
}

function parseAppraisalPayload(content: string): AppraisalReport {
  const parsed: unknown = JSON.parse(extractJsonContent(content));

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Gemini geçerli bir JSON nesnesi döndürmedi.");
  }

  const record = parsed as Record<string, unknown>;
  const lokasyon = (record.lokasyon ?? {}) as Record<string, unknown>;
  const fiyat = (record.fiyat_analizi ?? {}) as Record<string, unknown>;

  return {
    lokasyon: {
      enlem: Number(lokasyon.enlem) || 39.0,
      boylam: Number(lokasyon.boylam) || 35.0,
    },
    genel_skor: Math.min(100, Math.max(0, Number(record.genel_skor) || 0)),
    fiyat_analizi: {
      tahmini_deger: String(fiyat.tahmini_deger ?? ""),
      ortalama_m2_fiyat: String(fiyat.ortalama_m2_fiyat ?? ""),
    },
    radar_metrikleri: parseRadarMetrikleri(record.radar_metrikleri),
    emsal_analizi: parseEmsalAnalizi(record.emsal_analizi),
    karlilik_oranlari: parseKarlilikOranlari(record.karlilik_oranlari),
    uzman_gorusu: String(record.uzman_gorusu ?? ""),
    detayli_bolge_analizi: String(record.detayli_bolge_analizi ?? ""),
    yatirim_ve_risk_raporu: String(record.yatirim_ve_risk_raporu ?? ""),
    fiyat_analizi_gerekcesi: String(record.fiyat_analizi_gerekcesi ?? ""),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AppraisalRequestBody;

    const hasInput = [
      body.il,
      body.ilce,
      body.mahalle,
      body.ada,
      body.parsel,
      body.brutMetrekare,
      body.netMetrekare,
    ].some((value) => typeof value === "string" && value.trim().length > 0);

    if (!hasInput) {
      return NextResponse.json(
        {
          error:
            "En az il, ilçe, mahalle, ada/parsel veya brüt/net m² bilgisi girilmelidir.",
        },
        { status: 400 },
      );
    }

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0,
      },
    });

    const result = await model.generateContent([
      { text: APPRAISAL_PROMPT },
      {
        text: `Aşağıdaki mülk verilerine göre tutarlı ve uzun formatlı değerleme JSON'unu üret:\n\n${buildPropertyBrief(body)}`,
      },
    ]);

    const rawContent = result.response.text()?.trim();

    if (!rawContent) {
      return NextResponse.json(
        { error: "Gemini değerleme raporu üretemedi." },
        { status: 502 },
      );
    }

    const data = parseAppraisalPayload(rawContent);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[POST /api/appraisal]", error);

    const message =
      error instanceof Error
        ? error.message
        : "Değerleme raporu oluşturulurken beklenmeyen bir hata oluştu.";

    const status = message.includes("GEMINI_API_KEY")
      ? 500
      : message.includes("JSON") || message.includes("Gemini")
        ? 502
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
