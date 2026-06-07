import * as cheerio from "cheerio";
import type { Cheerio, CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";

import { parsePriceToInteger } from "@/lib/fsbo/price-parser";

export type ParsedFsboListing = {
  title: string;
  price: number | null;
  coverImage: string | null;
  url: string;
  location: string | null;
  listedAt: Date | null;
  listingNo: string | null;
  odaSayisi: string | null;
  metrekare: number | null;
  source: string;
};

const SAHIBINDEN_ORIGIN = "https://www.sahibinden.com";

function normalizeListingUrl(href: string | undefined): string | null {
  if (!href?.trim()) return null;

  try {
    if (href.startsWith("http")) {
      const parsed = new URL(href);
      if (!parsed.hostname.includes("sahibinden.com")) return null;
      return parsed.toString();
    }

    if (href.startsWith("/")) {
      return new URL(href, SAHIBINDEN_ORIGIN).toString();
    }
  } catch {
    return null;
  }

  return null;
}

function extractListingNo(url: string): string | null {
  const match = url.match(/(\d{8,12})(?:\/detay)?(?:\?|$)/);
  return match?.[1] ?? null;
}

function extractOdaSayisi(text: string): string | null {
  const match = text.match(/(\d+\+\d+)/);
  return match?.[1] ?? null;
}

function extractMetrekare(text: string): number | null {
  const match = text.match(/(\d{2,4})\s*m[²2]/i);
  if (!match?.[1]) return null;
  const value = Number(match[1]);
  return Number.isNaN(value) ? null : value;
}

function parseListedAt(text: string): Date | null {
  const trimmed = text.trim().toLowerCase();
  if (!trimmed) return null;

  const now = new Date();

  if (trimmed.includes("bugün")) return now;

  if (trimmed.includes("dün")) {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    return date;
  }

  const daysMatch = trimmed.match(/(\d+)\s*gün/);
  if (daysMatch?.[1]) {
    const date = new Date(now);
    date.setDate(date.getDate() - Number(daysMatch[1]));
    return date;
  }

  const absoluteMatch = trimmed.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (absoluteMatch) {
    const [, day, month, year] = absoluteMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function readText($: CheerioAPI, element: Cheerio<AnyNode>, selectors: string[]) {
  for (const selector of selectors) {
    try {
      const text = element.find(selector).first().text().replace(/\s+/g, " ").trim();
      if (text) return text;
    } catch {
      // selector değişmiş olabilir
    }
  }
  return "";
}

function readImageSrc(
  $: CheerioAPI,
  element: Cheerio<AnyNode>,
): string | null {
  const selectors = [
    ".searchResultsLargeThumbnail img",
    ".searchResultsPromoThumbnail img",
    "img.s-image",
    "img",
  ];

  for (const selector of selectors) {
    try {
      const img = element.find(selector).first();
      const src = img.attr("data-src") ?? img.attr("data-original") ?? img.attr("src");
      if (src?.trim() && !src.includes("data:image")) {
        if (src.startsWith("//")) return `https:${src}`;
        if (src.startsWith("/")) return new URL(src, SAHIBINDEN_ORIGIN).toString();
        return src;
      }
    } catch {
      // görsel seçici başarısız
    }
  }

  return null;
}

function readListingUrl(
  $: CheerioAPI,
  element: Cheerio<AnyNode>,
): string | null {
  const selectors = [
    "a.classifiedTitle",
    ".searchResultsTitleValue a",
    "a[href*='/ilan/']",
    "a[href*='sahibinden.com']",
  ];

  for (const selector of selectors) {
    try {
      const href = element.find(selector).first().attr("href");
      const normalized = normalizeListingUrl(href);
      if (normalized) return normalized;
    } catch {
      // url seçici başarısız
    }
  }

  return null;
}

function parseListingRow(
  $: CheerioAPI,
  element: Cheerio<AnyNode>,
): ParsedFsboListing | null {
  let title = "";
  try {
    title = readText($, element, [
      "a.classifiedTitle",
      ".searchResultsTitleValue",
      ".classifiedTitle",
    ]);
  } catch (error) {
    console.error("[fsbo-sync] İlan başlığı parse edilemedi:", error);
  }

  let price: number | null = null;
  try {
    const priceText = readText($, element, [
      ".searchResultsPriceValue",
      ".price",
      "td[class*='Price']",
    ]);
    price = parsePriceToInteger(priceText);
  } catch (error) {
    console.error("[fsbo-sync] Fiyat parse edilemedi:", error);
  }

  let coverImage: string | null = null;
  try {
    coverImage = readImageSrc($, element);
  } catch (error) {
    console.error("[fsbo-sync] Kapak fotoğrafı parse edilemedi:", error);
  }

  let url: string | null = null;
  try {
    url = readListingUrl($, element);
  } catch (error) {
    console.error("[fsbo-sync] İlan URL parse edilemedi:", error);
  }

  let location: string | null = null;
  try {
    location =
      readText($, element, [
        ".searchResultsLocationValue",
        ".location",
        "td[class*='Location']",
      ]) || null;
  } catch (error) {
    console.error("[fsbo-sync] Lokasyon parse edilemedi:", error);
  }

  let listedAt: Date | null = null;
  try {
    const dateText = readText($, element, [
      ".searchResultsDateValue",
      ".searchResultsDateValue span",
      "td[class*='Date']",
    ]);
    listedAt = parseListedAt(dateText);
  } catch (error) {
    console.error("[fsbo-sync] İlan tarihi parse edilemedi:", error);
  }

  const attributeText = readText($, element, [
    ".searchResultsAttributeValue",
    ".searchResultsTagAttributeValue",
  ]);

  const listingNo = url ? extractListingNo(url) : null;
  const odaSayisi = extractOdaSayisi(`${title} ${attributeText}`);
  const metrekare = extractMetrekare(`${title} ${attributeText}`);

  if (!title || !url) {
    return null;
  }

  return {
    title,
    price,
    coverImage,
    url,
    location,
    listedAt,
    listingNo,
    odaSayisi,
    metrekare,
    source: "sahibinden",
  };
}

export function parseSahibindenSearchResults(html: string): ParsedFsboListing[] {
  const $ = cheerio.load(html);
  const results: ParsedFsboListing[] = [];

  const rowSelectors = [
    "tr.searchResultsItem",
    ".searchResultsItem",
    "li.searchResultsItem",
    "[data-id]",
  ];

  let rows: Cheerio<AnyNode> | null = null;

  for (const selector of rowSelectors) {
    const found = $(selector);
    if (found.length > 0) {
      rows = found;
      break;
    }
  }

  if (!rows || rows.length === 0) {
    console.error(
      "[fsbo-sync] Sahibinden liste sayfasında ilan satırı bulunamadı. Arayüz güncellenmiş olabilir.",
    );
    return [];
  }

  rows.each((_, node) => {
    try {
      const parsed = parseListingRow($, $(node));
      if (parsed) {
        results.push(parsed);
      }
    } catch (error) {
      console.error("[fsbo-sync] İlan satırı işlenirken hata:", error);
    }
  });

  const maxResults = Number(process.env.FSBO_MAX_SEARCH_RESULTS ?? 25);
  return results.slice(0, maxResults);
}

export function isCompleteParsedListing(
  listing: ParsedFsboListing,
): listing is ParsedFsboListing & {
  title: string;
  url: string;
  price: number;
} {
  return Boolean(
    listing.title?.trim() &&
      listing.url?.trim() &&
      listing.price &&
      listing.price > 0,
  );
}

export function extractListingLinksFromSearch(
  html: string,
): string[] {
  const $ = cheerio.load(html);
  const urls = new Set<string>();

  $("a[href]").each((_, element) => {
    try {
      const href = $(element).attr("href");
      if (!href) return;
      if (!href.includes("/ilan/")) return;

      const absolute = href.startsWith("http")
        ? href
        : new URL(href, SAHIBINDEN_ORIGIN).toString();

      if (!absolute.includes("sahibinden.com")) return;
      if (!absolute.match(/\d{8,}/)) return;

      urls.add(absolute.split("?")[0]);
    } catch {
      // link atlandı
    }
  });

  const maxResults = Number(process.env.FSBO_MAX_SEARCH_RESULTS ?? 25);
  const maxDetailFetch = Number(process.env.FSBO_MAX_DETAIL_FETCH ?? 12);

  return Array.from(urls).slice(0, Math.min(maxResults, maxDetailFetch));
}
