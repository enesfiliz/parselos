import * as cheerio from "cheerio";
import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";

import { buildScrapeTargetsForRegion } from "@/lib/radar/scrape-targets";
import { getCachedSourceHealth } from "@/lib/radar/source-health";
import {
  fetchListingHtmlDirect,
  fetchListingViaJinaReader,
} from "@/lib/scrape/listing-fetcher";

const DEFAULT_REGION = "Bilecik Söğüt";
const DEFAULT_KEYWORDS = ["sanayi", "imar planı", "parsel", "askı"] as const;

export interface RadarAnnouncement {
  id: string;
  title: string;
  summary: string;
  region: string;
  source: string;
  sourceUrl: string;
  verified: boolean;
  publishedAt: string;
  matchedKeywords: string[];
  isNew: boolean;
  category: "aski" | "plan-degisikligi" | "parsel" | "sanayi" | "diger";
  sourceHealth?: "healthy" | "unavailable" | "expired" | "unchecked";
  lastCheckedAt?: string;
}

export interface RadarAnalysis {
  summary: string;
  totalMatches: number;
  newCount: number;
  categories: { id: string; label: string; count: number }[];
  trackedKeywords: string[];
  lastScannedAt: string;
  activityLevel: "dusuk" | "orta" | "yuksek";
  scannedSources: number;
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

function resolveSourceUrl(pageUrl: string, href: string | undefined): string {
  if (!href?.trim()) return pageUrl;
  try {
    return new URL(href, pageUrl).href;
  } catch {
    return pageUrl;
  }
}

function sourceLabelFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.endsWith(".bel.tr")) {
      const slug = host.split(".")[0];
      return `${slug.charAt(0).toUpperCase()}${slug.slice(1)} Belediyesi`;
    }
    if (host.endsWith(".gov.tr")) return "Resmi Duyuru";
    return host;
  } catch {
    return "Kaynak";
  }
}

function categorize(text: string): RadarAnnouncement["category"] {
  const lower = text.toLocaleLowerCase("tr-TR");
  if (lower.includes("askı")) return "aski";
  if (lower.includes("parsel")) return "parsel";
  if (lower.includes("sanayi")) return "sanayi";
  if (lower.includes("plan")) return "plan-degisikligi";
  return "diger";
}

function buildAnalysis(
  region: string,
  keywords: string[],
  announcements: RadarAnnouncement[],
  scannedSources: number,
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

  const summary =
    announcements.length > 0
      ? `${region} için ${announcements.length} eşleşen duyuru (${scannedSources} kaynak tarandı).`
      : `${region} için ${scannedSources} resmi kaynak tarandı; eşleşen duyuru bulunamadı.`;

  return {
    summary,
    totalMatches: announcements.length,
    newCount,
    categories,
    trackedKeywords: keywords,
    lastScannedAt: new Date().toISOString(),
    activityLevel,
    scannedSources,
  };
}

function parseMarkdownLinks(
  markdown: string,
  pageUrl: string,
  region: string,
  keywords: readonly string[],
): RadarAnnouncement[] {
  const results: RadarAnnouncement[] = [];
  const seen = new Set<string>();

  for (const match of markdown.matchAll(/\[([^\]]+)]\((https?:\/\/[^)]+)\)/gi)) {
    const text = normalizeText(match[1]);
    if (text.length < 12 || text.length > 220) continue;

    const matchedKeywords = matchesKeywords(text, keywords);
    if (matchedKeywords.length === 0) continue;

    const sourceUrl = match[2];
    if (seen.has(sourceUrl)) continue;
    seen.add(sourceUrl);

    results.push({
      id: `${pageUrl}-md-${results.length}`,
      title: text.slice(0, 120),
      summary: text,
      region,
      source: sourceLabelFromUrl(sourceUrl),
      sourceUrl,
      verified: true,
      publishedAt: new Date().toISOString(),
      matchedKeywords,
      isNew: true,
      category: categorize(text),
    });
  }

  return results;
}

function parseHtmlAnnouncements(
  html: string,
  pageUrl: string,
  region: string,
  keywords: readonly string[],
): RadarAnnouncement[] {
  const $ = cheerio.load(html);
  const results: RadarAnnouncement[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, element) => {
    const text = normalizeText($(element).text());
    if (text.length < 12 || text.length > 220) return;

    const matchedKeywords = matchesKeywords(text, keywords);
    if (matchedKeywords.length === 0) return;

    const href = $(element).attr("href");
    const sourceUrl = resolveSourceUrl(pageUrl, href);
    if (seen.has(sourceUrl)) return;
    seen.add(sourceUrl);

    results.push({
      id: `${pageUrl}-${results.length}-${text.slice(0, 16)}`,
      title: text.slice(0, 120),
      summary: text,
      region,
      source: sourceLabelFromUrl(sourceUrl),
      sourceUrl,
      verified: true,
      publishedAt: new Date().toISOString(),
      matchedKeywords,
      isNew: true,
      category: categorize(text),
    });
  });

  return results;
}

async function fetchPageContent(url: string): Promise<string | null> {
  const direct = await fetchListingHtmlDirect(url);
  if (direct && direct.length > 400) return direct;
  return fetchListingViaJinaReader(url);
}

async function scrapeAnnouncements(
  region: string,
  keywords: readonly string[],
): Promise<{ announcements: RadarAnnouncement[]; scannedSources: number }> {
  const targets = buildScrapeTargetsForRegion(region);
  const merged: RadarAnnouncement[] = [];
  const seenUrls = new Set<string>();
  let scannedSources = 0;

  const batches = await Promise.allSettled(
    targets.map(async (url) => {
      const content = await fetchPageContent(url);
      if (!content) return { url, batch: [] as RadarAnnouncement[] };

      const isMarkdown =
        !content.includes("<html") && !content.includes("<body");
      const batch = isMarkdown
        ? parseMarkdownLinks(content, url, region, keywords)
        : parseHtmlAnnouncements(content, url, region, keywords);

      return { url, batch };
    }),
  );

  for (const result of batches) {
    if (result.status !== "fulfilled" || result.value.batch.length === 0) continue;

    scannedSources += 1;

    for (const item of result.value.batch) {
      if (seenUrls.has(item.sourceUrl)) continue;
      seenUrls.add(item.sourceUrl);
      merged.push(item);
    }

    if (merged.length >= 12) break;
  }

  return { announcements: merged.slice(0, 12), scannedSources };
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

    const cacheKey = `${region}:${keywords.join(",")}`;
    const scrapeCached = unstable_cache(
      () => scrapeAnnouncements(region, keywords),
      ["imar-radar", cacheKey],
      { revalidate: 300 },
    );

    const { announcements, scannedSources } = await scrapeCached();

    const enriched = await Promise.all(
      announcements.map(async (item) => {
        if (!item.sourceUrl) return item;
        const health = await getCachedSourceHealth(item.sourceUrl);
        return {
          ...item,
          sourceHealth: health.status,
          lastCheckedAt: health.lastCheckedAt,
        };
      }),
    );

    const analysis = buildAnalysis(region, keywords, enriched, scannedSources);

    return NextResponse.json({
      region,
      keywords,
      mode: enriched.length > 0 ? "live" : "empty",
      announcements: enriched,
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
