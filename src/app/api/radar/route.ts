import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

const DEFAULT_REGION = "Bilecik Söğüt";
const DEFAULT_KEYWORDS = ["sanayi", "imar planı", "parsel", "askı"] as const;

function formatRegionLabel(region: string) {
  const parts = region
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return { district: parts[0], city: parts[1], label: `${parts[0]}, ${parts[1]}` };
  }

  const single = parts[0] ?? region;
  return { district: single, city: single, label: single };
}

const SCRAPE_TARGETS = [
  "https://www.sogut.bel.tr/tr/icerik/duyurular",
  "https://www.bilecik.gov.tr/duyurular",
] as const;

export interface RadarAnnouncement {
  id: string;
  title: string;
  summary: string;
  region: string;
  source: string;
  publishedAt: string;
  matchedKeywords: string[];
  isNew: boolean;
  category: "aski" | "plan-degisikligi" | "parsel" | "sanayi" | "diger";
}

export interface RadarAnalysis {
  summary: string;
  totalMatches: number;
  newCount: number;
  categories: { id: string; label: string; count: number }[];
  trackedKeywords: string[];
  lastScannedAt: string;
  activityLevel: "dusuk" | "orta" | "yuksek";
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function matchesKeywords(text: string, keywords: readonly string[]) {
  const lower = text.toLocaleLowerCase("tr-TR");
  return keywords.filter((keyword) =>
    lower.includes(keyword.toLocaleLowerCase("tr-TR")),
  );
}

function buildDummyAnnouncements(
  region: string,
  keywords: readonly string[],
): RadarAnnouncement[] {
  const now = Date.now();
  const { district, city, label } = formatRegionLabel(region);
  const authority = city !== district ? `${city} ${district}` : district;

  const templates: Omit<RadarAnnouncement, "id" | "region" | "matchedKeywords">[] = [
    {
      title: `${district} OSB Güney Parsel Uzatım Planı Askıya Çıktı`,
      summary: `${label} sınırlarında organize sanayi bölgesi güneyindeki parsel sınırları için 1/5000 ölçekli nazım imar planı değişikliği 30 gün süreyle askıya alındı.`,
      source: `${authority} İl Özel İdaresi (Örnek)`,
      publishedAt: new Date(now - 1000 * 60 * 45).toISOString(),
      isNew: true,
      category: "aski",
    },
    {
      title: `${district} Merkez 124 Ada 8 Parsel İmar Durumu Güncellendi`,
      summary: `${label} bölgesinde 124 ada 8 parsel için imar planı notları revize edildi; fonksiyon ve yapılaşma koşulları güncellendi.`,
      source: `${district} Belediyesi (Örnek)`,
      publishedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      isNew: true,
      category: "parsel",
    },
    {
      title: `${district} 1/1000 Uygulama İmar Planı Değişikliği İlanı`,
      summary: `${label} kapsamında konut ve ticari alanlara yönelik uygulama imar planı değişikliği belediye ilan panosunda ve e-belediye duyurularında yayımlandı.`,
      source: `${city} Çevre, Şehircilik (Örnek)`,
      publishedAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      isNew: false,
      category: "plan-degisikligi",
    },
    {
      title: `${district} Sanayi Alanı Genişleme Planı Halkın Bilgisine Sunuldu`,
      summary: `${label} içindeki sanayi alanlarına ilişkin fonksiyon değişikliği ve yol hizası revizyonu içeren plan değişikliği askı sürecine alındı.`,
      source: `${authority} Planlama Müdürlüğü (Örnek)`,
      publishedAt: new Date(now - 1000 * 60 * 60 * 52).toISOString(),
      isNew: false,
      category: "sanayi",
    },
  ];

  return templates
    .map((item, index) => {
      const text = `${item.title} ${item.summary}`.toLocaleLowerCase("tr-TR");
      const matchedKeywords = keywords.filter((keyword) =>
        text.includes(keyword.toLocaleLowerCase("tr-TR")),
      );

      return {
        ...item,
        id: `dummy-${label}-${index}`,
        region: label,
        matchedKeywords:
          matchedKeywords.length > 0 ? matchedKeywords : [...keywords].slice(0, 2),
      };
    })
    .filter((item) => item.matchedKeywords.length > 0);
}

function buildAnalysis(
  region: string,
  keywords: string[],
  announcements: RadarAnnouncement[],
): RadarAnalysis {
  const newCount = announcements.filter((item) => item.isNew).length;
  const categoryLabels: Record<RadarAnnouncement["category"], string> = {
    aski: "Plan Askısı",
    "plan-degisikligi": "Plan Değişikliği",
    parsel: "Parsel Güncelleme",
    sanayi: "Sanayi Alanı",
    diger: "Diğer",
  };

  const categoryMap = new Map<string, number>();
  for (const item of announcements) {
    const label = categoryLabels[item.category];
    categoryMap.set(label, (categoryMap.get(label) ?? 0) + 1);
  }

  const categories = [...categoryMap.entries()].map(([label, count]) => ({
    id: label.toLocaleLowerCase("tr-TR").replace(/\s+/g, "-"),
    label,
    count,
  }));

  const activityLevel: RadarAnalysis["activityLevel"] =
    newCount >= 2 ? "yuksek" : newCount === 1 ? "orta" : "dusuk";

  return {
    summary: `${region} bölgesi için ${announcements.length} imar/sanayi duyurusu izleniyor. Son taramada ${newCount} yeni kayıt, ${categories.length} farklı duyuru tipi tespit edildi.`,
    totalMatches: announcements.length,
    newCount,
    categories,
    trackedKeywords: keywords,
    lastScannedAt: new Date().toISOString(),
    activityLevel,
  };
}

async function scrapeAnnouncements(
  region: string,
  keywords: readonly string[],
): Promise<RadarAnnouncement[]> {
  const results: RadarAnnouncement[] = [];

  for (const url of SCRAPE_TARGETS) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "ParselosImarRadari/1.0 (+https://parselos.local; zoning-monitor)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 0 },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      $("a, li, article, .duyuru, .haber, .news-item, .list-group-item").each(
        (_, element) => {
          const text = normalizeText($(element).text());
          if (text.length < 24 || text.length > 280) return;

          const matchedKeywords = matchesKeywords(text, keywords);
          if (matchedKeywords.length === 0) return;

          const href = $(element).attr("href") ?? $(element).find("a").attr("href");
          const source = href ? `${url.split("/").slice(0, 3).join("/")}${href.startsWith("/") ? href : `/${href}`}` : url;

          const lower = text.toLocaleLowerCase("tr-TR");
          const category: RadarAnnouncement["category"] = lower.includes("askı")
            ? "aski"
            : lower.includes("parsel")
              ? "parsel"
              : lower.includes("sanayi")
                ? "sanayi"
                : lower.includes("plan")
                  ? "plan-degisikligi"
                  : "diger";

          results.push({
            id: `${url}-${results.length}-${text.slice(0, 24)}`,
            title: text.slice(0, 120),
            summary: text,
            region,
            source,
            publishedAt: new Date().toISOString(),
            matchedKeywords,
            isNew: true,
            category,
          });
        },
      );

      if (results.length > 0) break;
    } catch {
      continue;
    }
  }

  return results.slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region")?.trim() || DEFAULT_REGION;
    const keywordsParam = searchParams.get("keywords");
    const keywords = keywordsParam
      ? keywordsParam
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [...DEFAULT_KEYWORDS];

    const liveResults = await scrapeAnnouncements(region, keywords);
    const announcements =
      liveResults.length > 0
        ? liveResults
        : buildDummyAnnouncements(region, keywords);
    const analysis = buildAnalysis(region, keywords, announcements);

    return NextResponse.json({
      region,
      keywords,
      mode: liveResults.length > 0 ? "live" : "dummy",
      announcements,
      analysis,
    });
  } catch (error) {
    console.error("[GET /api/radar]", error);

    const message =
      error instanceof Error
        ? error.message
        : "Radar taraması sırasında beklenmeyen bir hata oluştu.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
