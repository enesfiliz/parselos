import * as cheerio from "cheerio";

const SAHIBINDEN_ORIGIN = "https://www.sahibinden.com";

function parsePrice(text) {
  if (!text?.trim()) return null;

  const patterns = [
    /(\d{1,3}(?:\.\d{3})+)\s*(?:TL|₺)/i,
    /(?:TL|₺)\s*(\d{1,3}(?:\.\d{3})+)/i,
    /(\d{4,})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const amount = Number(match[1].replace(/[^\d]/g, ""));
      if (!Number.isNaN(amount) && amount >= 10_000) return amount;
    }
  }

  const digits = text.replace(/[^\d]/g, "");
  const fallback = Number(digits);
  return !Number.isNaN(fallback) && fallback >= 10_000 ? fallback : null;
}

function normalizeImageUrl(src) {
  if (!src?.trim() || src.includes("data:image")) return null;
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("/")) return new URL(src, SAHIBINDEN_ORIGIN).toString();
  return src;
}

function extractMetrekare(text) {
  const match = text.match(/(\d{2,4})\s*m[²2]/i);
  if (!match?.[1]) return null;
  const value = Number(match[1]);
  return Number.isNaN(value) ? null : value;
}

function extractOdaSayisi(text) {
  return text.match(/(\d+\+\d+)/)?.[1] ?? null;
}

function extractListingNo(url, html) {
  const fromUrl = url.match(/(\d{8,12})(?:\/detay)?(?:\?|$)/);
  if (fromUrl?.[1]) return fromUrl[1];

  const fromHtml = html.match(/(?:ilan\s*no|classifiedId)["'\s:>]+(\d{7,})/i);
  return fromHtml?.[1] ?? null;
}

function detectSource(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("hepsiemlak")) return "hepsiemlak";
    if (host.includes("emlakjet")) return "emlakjet";
    if (host.includes("sahibinden")) return "sahibinden";
  } catch {
    // ignore
  }
  return "sahibinden";
}

function pickFirstText($, selectors) {
  for (const selector of selectors) {
    const text = $(selector).first().text().replace(/\s+/g, " ").trim();
    if (text) return text;
  }
  return "";
}

export function extractListingLinks(html, baseUrl, limit = 12) {
  const $ = cheerio.load(html);
  const urls = new Set();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href || !href.includes("/ilan/")) return;

    try {
      const absolute = href.startsWith("http")
        ? href
        : new URL(href, baseUrl).toString();

      if (!absolute.match(/\d{8,}/)) return;
      urls.add(absolute.split("?")[0]);
    } catch {
      // atlandı
    }
  });

  return Array.from(urls).slice(0, limit);
}

export function parseListingPage(url, html) {
  const $ = cheerio.load(html);
  const source = detectSource(url);
  const bodyText = $("body").text().replace(/\s+/g, " ");

  const title =
    pickFirstText($, [
      "h1.classifiedDetailTitle",
      ".classifiedDetailTitle h1",
      "h1",
      "[data-testid='classified-title']",
      ".listing-title",
      ".detail-title",
    ]) ||
    $("meta[property='og:title']").attr("content")?.trim() ||
    "";

  const priceText =
    pickFirstText($, [
      ".classifiedInfo h3",
      ".classified-price-wrapper",
      "[data-testid='classified-price']",
      ".classified-price",
      ".price",
      ".listing-price",
    ]) ||
    $("meta[property='product:price:amount']").attr("content") ||
    "";

  const location =
    pickFirstText($, [
      ".classifiedInfo h2",
      ".classified-location",
      "[data-testid='classified-location']",
      ".location",
    ]) || null;

  const imageCandidates = [
    $("meta[property='og:image']").attr("content"),
    $("meta[name='twitter:image']").attr("content"),
    $(".classifiedDetailMainPhoto img").attr("src"),
    $(".gallery img").first().attr("data-src"),
    $(".gallery img").first().attr("src"),
    $("img[data-src]").first().attr("data-src"),
  ];

  const images = [];
  for (const candidate of imageCandidates) {
    const normalized = normalizeImageUrl(candidate);
    if (normalized && !images.includes(normalized)) {
      images.push(normalized);
    }
  }

  const listingNo = extractListingNo(url, html);
  const metrekare = extractMetrekare(bodyText.slice(0, 6000));
  const odaSayisi = extractOdaSayisi(`${title} ${bodyText.slice(0, 2000)}`);
  const price = parsePrice(priceText);

  if (!title || !url || !price) {
    return null;
  }

  return {
    title,
    url,
    price,
    location,
    metrekare,
    odaSayisi,
    listingNo,
    images,
    source,
  };
}
