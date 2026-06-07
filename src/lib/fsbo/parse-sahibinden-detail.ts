import * as cheerio from "cheerio";

import { parsePriceToInteger } from "@/lib/fsbo/price-parser";
import type { ParsedFsboListing } from "@/lib/fsbo/parse-sahibinden-list";

const SAHIBINDEN_ORIGIN = "https://www.sahibinden.com";

function pickFirstText($: cheerio.CheerioAPI, selectors: string[]): string {
  for (const selector of selectors) {
    try {
      const text = $(selector).first().text().replace(/\s+/g, " ").trim();
      if (text) return text;
    } catch {
      // selector değişmiş olabilir
    }
  }
  return "";
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

function extractListingNo(url: string, html: string): string | null {
  const fromUrl = url.match(/(\d{8,12})(?:\/detay)?(?:\?|$)/);
  if (fromUrl?.[1]) return fromUrl[1];

  const fromHtml = html.match(/(?:ilan\s*no|classifiedId)["'\s:>]+(\d{7,})/i);
  return fromHtml?.[1] ?? null;
}

function extractOdaSayisi(text: string): string | null {
  return text.match(/(\d+\+\d+)/)?.[1] ?? null;
}

function extractMetrekare(text: string): number | null {
  const match = text.match(/(\d{2,4})\s*m[²2]/i);
  if (!match?.[1]) return null;
  const value = Number(match[1]);
  return Number.isNaN(value) ? null : value;
}

function readCoverImage($: cheerio.CheerioAPI): string | null {
  const candidates = [
    $('meta[property="og:image"]').attr("content"),
    $('meta[name="twitter:image"]').attr("content"),
    $(".classifiedDetailMainPhoto img").attr("src"),
    $(".gallery img").first().attr("data-src"),
    $(".gallery img").first().attr("src"),
  ];

  for (const src of candidates) {
    if (!src?.trim() || src.includes("data:image")) continue;
    if (src.startsWith("//")) return `https:${src}`;
    if (src.startsWith("/")) return new URL(src, SAHIBINDEN_ORIGIN).toString();
    return src;
  }

  return null;
}

export function parseSahibindenDetailPage(
  url: string,
  html: string,
): ParsedFsboListing | null {
  const $ = cheerio.load(html);

  let title = "";
  try {
    title =
      pickFirstText($, [
        "h1.classifiedDetailTitle",
        ".classifiedDetailTitle h1",
        "h1",
        "[data-testid='classified-title']",
      ]) ||
      $('meta[property="og:title"]').attr("content")?.trim() ||
      "";
  } catch (error) {
    console.error("[fsbo-sync] Detay başlığı parse edilemedi:", error);
  }

  let price: number | null = null;
  try {
    const priceText =
      pickFirstText($, [
        ".classifiedInfo h3",
        ".classified-price-wrapper",
        "[data-testid='classified-price']",
        ".classified-price",
      ]) ||
      $('meta[property="product:price:amount"]').attr("content") ||
      "";
    price = parsePriceToInteger(priceText);
  } catch (error) {
    console.error("[fsbo-sync] Detay fiyatı parse edilemedi:", error);
  }

  let location: string | null = null;
  try {
    location =
      pickFirstText($, [
        ".classifiedInfo h2",
        ".classified-location",
        "[data-testid='classified-location']",
      ]) || null;
  } catch (error) {
    console.error("[fsbo-sync] Detay lokasyonu parse edilemedi:", error);
  }

  let listedAt: Date | null = null;
  try {
    const dateText = pickFirstText($, [
      ".classifiedInfoList li",
      "[data-testid='classified-date']",
    ]);
    listedAt = parseListedAt(dateText);
  } catch (error) {
    console.error("[fsbo-sync] Detay ilan tarihi parse edilemedi:", error);
  }

  let coverImage: string | null = null;
  try {
    coverImage = readCoverImage($);
  } catch (error) {
    console.error("[fsbo-sync] Detay kapak fotoğrafı parse edilemedi:", error);
  }

  const bodyText = $("body").text().replace(/\s+/g, " ");
  const listingNo = extractListingNo(url, html);
  const odaSayisi = extractOdaSayisi(`${title} ${bodyText.slice(0, 2000)}`);
  const metrekare = extractMetrekare(bodyText.slice(0, 5000));

  if (!title || !url) return null;

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
