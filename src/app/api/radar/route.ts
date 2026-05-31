import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

const DEFAULT_REGION = "Bilecik Söğüt";
const DEFAULT_KEYWORDS = ["sanayi", "imar planı", "parsel"] as const;

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

function buildDummyAnnouncements(region: string): RadarAnnouncement[] {
  const now = Date.now();

  return [
    {
      id: "dummy-1",
      title: "Söğüt OSB Güney Parsel Uzatım Planı Askıya Çıktı",
      summary:
        "Organize sanayi bölgesi güneyindeki parsel sınırları için 1/5000 ölçekli nazım imar planı değişikliği 30 gün süreyle askıya alındı.",
      region,
      source: "Bilecik Söğüt İl Özel İdaresi (Örnek)",
      publishedAt: new Date(now - 1000 * 60 * 45).toISOString(),
      matchedKeywords: ["sanayi", "imar planı", "parsel"],
      isNew: true,
    },
    {
      id: "dummy-2",
      title: "Elmacık Mahallesi 124 Ada 8 Parsel İmar Durumu Güncellendi",
      summary:
        "Söğüt ilçesi Elmacık mahallesi 124 ada 8 parsel için imar planı notları revize edildi; sanayi alanı fonksiyonu korunmuştur.",
      region,
      source: "Söğüt Belediyesi (Örnek)",
      publishedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      matchedKeywords: ["parsel", "imar planı"],
      isNew: true,
    },
    {
      id: "dummy-3",
      title: "2026/1 Dönemi Sanayi İmar Planı Değişikliği Halkın Bilgisine Sunuldu",
      summary:
        "Bilecik Söğüt sınırları içinde sanayi alanlarına yönelik 1/1000 uygulama imar planı değişikliği duyuru panosunda yayımlandı.",
      region,
      source: "Bilecik Çevre, Şehircilik (Örnek)",
      publishedAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      matchedKeywords: ["sanayi", "imar planı"],
      isNew: false,
    },
  ];
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

          results.push({
            id: `${url}-${results.length}-${text.slice(0, 24)}`,
            title: text.slice(0, 120),
            summary: text,
            region,
            source,
            publishedAt: new Date().toISOString(),
            matchedKeywords,
            isNew: true,
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
      liveResults.length > 0 ? liveResults : buildDummyAnnouncements(region);

    return NextResponse.json({
      region,
      keywords,
      mode: liveResults.length > 0 ? "live" : "dummy",
      announcements,
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
