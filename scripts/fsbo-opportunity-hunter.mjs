import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";
import crypto from "node:crypto";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";

const DEFAULT_CONFIG_PATH = "scripts/fsbo-watchlist.json";
const SOURCE = "sahibinden";
const STALE_LISTING_DAYS = Number(process.env.FSBO_STALE_DAYS ?? 60);
const MIN_DELAY_MS = Number(process.env.FSBO_MIN_DELAY_MS ?? 4500);
const MAX_DELAY_MS = Number(process.env.FSBO_MAX_DELAY_MS ?? 11000);
const MAX_SEARCH_RESULTS = Number(process.env.FSBO_MAX_SEARCH_RESULTS ?? 25);
const REQUEST_TIMEOUT_MS = Number(process.env.FSBO_REQUEST_TIMEOUT_MS ?? 30000);
const USER_AGENT =
  process.env.FSBO_USER_AGENT ??
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36 ParselOS-FSBO-Watcher/1.0";

function normalizeConnectionString(connectionString) {
  if (
    !connectionString.includes("supabase.com") &&
    !connectionString.includes("supabase.co")
  ) {
    return connectionString;
  }

  const url = new URL(connectionString);
  url.searchParams.delete("sslmode");
  const query = url.searchParams.toString();
  url.search = query ? `?${query}` : "";
  return url.toString();
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/fsbo-opportunity-hunter.mjs");
  }

  const pool = new Pool({
    connectionString: normalizeConnectionString(databaseUrl),
    max: 2,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
    ssl:
      databaseUrl.includes("supabase.com") || databaseUrl.includes("supabase.co")
        ? { rejectUnauthorized: false }
        : undefined,
  });

  return {
    prisma: new PrismaClient({ adapter: new PrismaPg(pool) }),
    pool,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay() {
  return MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1));
}

function normalizeUrl(url) {
  const parsed = new URL(url);
  parsed.hash = "";
  parsed.searchParams.delete("pagingOffset");
  return parsed.toString();
}

function isSahibindenUrl(url) {
  try {
    return new URL(url).hostname.endsWith("sahibinden.com");
  } catch {
    return false;
  }
}

function toAbsoluteUrl(href, baseUrl) {
  try {
    return normalizeUrl(new URL(href, baseUrl).toString());
  } catch {
    return null;
  }
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "upgrade-insecure-requests": "1",
        "user-agent": USER_AGENT,
      },
      redirect: "follow",
    });

    if (response.status === 403 || response.status === 429) {
      throw new Error(`Blocked or rate limited with HTTP ${response.status}. Back off and reduce cron frequency.`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while fetching ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function hashHtml(html) {
  return crypto.createHash("sha256").update(html).digest("hex");
}

function parsePrice(text) {
  const cleaned = text
    .replace(/\u00a0/g, " ")
    .replace(/[^\d.,]/g, "")
    .trim();

  if (!cleaned) return null;

  const normalized =
    cleaned.includes(".") && cleaned.includes(",")
      ? cleaned.replaceAll(".", "").replace(",", ".")
      : cleaned.replace(/[.,](?=\d{3}\b)/g, "").replace(",", ".");

  const price = Number(normalized);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function parseDateFromText(text, now = new Date()) {
  const normalized = text.toLocaleLowerCase("tr-TR").trim();
  const numeric = normalized.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/u);

  if (numeric) {
    const [, day, month, year] = numeric;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const relative = normalized.match(/(\d+)\s+gun/u);
  if (relative) {
    const date = new Date(now);
    date.setDate(date.getDate() - Number(relative[1]));
    return date;
  }

  if (normalized.includes("bugun")) return now;

  if (normalized.includes("dun")) {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    return date;
  }

  return null;
}

function extractExternalId(url, html) {
  const idFromUrl = url.match(/(\d{7,})(?:\/detay)?\/?$/u)?.[1];
  if (idFromUrl) return idFromUrl;

  const idFromHtml = html.match(/(?:ilan\s*no|classifiedId)["'\s:>]+(\d{7,})/iu)?.[1];
  return idFromHtml ?? null;
}

function pickFirstText($, selectors) {
  for (const selector of selectors) {
    const text = $(selector).first().text().replace(/\s+/g, " ").trim();
    if (text) return text;
  }

  return null;
}

function parseListingPage(url, html) {
  const $ = cheerio.load(html);
  const title =
    pickFirstText($, [
      "h1",
      ".classifiedDetailTitle h1",
      "[data-testid='classified-title']",
      "meta[property='og:title']",
    ]) ?? $("meta[property='og:title']").attr("content")?.trim() ?? null;

  const priceText =
    pickFirstText($, [
      ".classifiedInfo h3",
      ".classified-price-wrapper",
      "[data-testid='classified-price']",
      ".classified-price",
    ]) ?? $("meta[property='product:price:amount']").attr("content") ?? null;

  const location =
    pickFirstText($, [
      ".classifiedInfo h2",
      ".classified-location",
      "[data-testid='classified-location']",
      ".classifiedDetailHeader .classifiedInfo",
    ]) ?? null;

  const listedAtText =
    pickFirstText($, [
      ".classifiedInfoList li:contains('Ilan Tarihi')",
      ".classifiedInfoList li:contains('İlan Tarihi')",
      "[data-testid='classified-date']",
    ]) ?? "";

  return {
    url,
    externalId: extractExternalId(url, html),
    title,
    location,
    price: parsePrice(priceText ?? ""),
    listedAt: parseDateFromText(listedAtText),
    rawHtmlHash: hashHtml(html),
  };
}

function extractListingLinks(searchUrl, html) {
  const $ = cheerio.load(html);
  const urls = new Set();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) return;

    if (!href.includes("/ilan/") && !href.includes("/detay")) return;

    const absolute = toAbsoluteUrl(href, searchUrl);
    if (absolute && isSahibindenUrl(absolute)) {
      urls.add(absolute);
    }
  });

  return Array.from(urls).slice(0, MAX_SEARCH_RESULTS);
}

function daysBetween(start, end) {
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
}

async function recordAlert(prisma, listing, parsed, reason, details) {
  const existing = await prisma.fsboOpportunityAlert.findFirst({
    where: {
      listingId: listing.id,
      reason,
      isResolved: false,
    },
    orderBy: { olusturulmaTarihi: "desc" },
  });

  if (existing) return existing;

  return prisma.fsboOpportunityAlert.create({
    data: {
      listingId: listing.id,
      reason,
      previousPrice: details.previousPrice ?? null,
      currentPrice: parsed.price ?? null,
      priceDropRate: details.priceDropRate ?? null,
      daysOnMarket: details.daysOnMarket ?? null,
    },
  });
}

async function upsertListing(prisma, parsed) {
  const now = new Date();

  const listing = await prisma.fsboTrackedListing.upsert({
    where: { url: parsed.url },
    create: {
      url: parsed.url,
      externalId: parsed.externalId,
      title: parsed.title,
      location: parsed.location,
      source: SOURCE,
      currentPrice: parsed.price,
      listedAt: parsed.listedAt,
      lastCheckedAt: now,
    },
    update: {
      externalId: parsed.externalId,
      title: parsed.title,
      location: parsed.location,
      listedAt: parsed.listedAt,
      lastCheckedAt: now,
      isActive: true,
    },
  });

  await prisma.fsboPriceSnapshot.create({
    data: {
      listingId: listing.id,
      price: parsed.price,
      title: parsed.title,
      location: parsed.location,
      rawHtmlHash: parsed.rawHtmlHash,
    },
  });

  const alerts = [];
  const previousPrice = listing.currentPrice === null ? null : Number(listing.currentPrice);
  const currentPrice = parsed.price;

  if (previousPrice && currentPrice && currentPrice < previousPrice) {
    const dropRate = (previousPrice - currentPrice) / previousPrice;
    alerts.push(
      await recordAlert(prisma, listing, parsed, "PRICE_DROP", {
        previousPrice,
        priceDropRate: dropRate,
      }),
    );
  }

  const firstKnownDate = parsed.listedAt ?? listing.listedAt ?? listing.firstSeenAt;
  const daysOnMarket = daysBetween(firstKnownDate, now);

  if (daysOnMarket >= STALE_LISTING_DAYS) {
    alerts.push(
      await recordAlert(prisma, listing, parsed, "STALE_LISTING", {
        previousPrice,
        daysOnMarket,
      }),
    );
  }

  const isUrgent = alerts.length > 0 || listing.isUrgent;
  const urgentReason = [
    currentPrice && previousPrice && currentPrice < previousPrice ? "PRICE_DROP" : null,
    daysOnMarket >= STALE_LISTING_DAYS ? "STALE_LISTING" : null,
  ]
    .filter(Boolean)
    .join(",");

  const updatedListing = await prisma.fsboTrackedListing.update({
    where: { id: listing.id },
    data: {
      currentPrice,
      lastPriceDropAt:
        currentPrice && previousPrice && currentPrice < previousPrice ? now : listing.lastPriceDropAt,
      isUrgent,
      urgentReason: urgentReason || listing.urgentReason,
    },
  });

  return { listing: updatedListing, alerts };
}

async function loadConfig() {
  const configPath = process.env.FSBO_CONFIG_PATH ?? DEFAULT_CONFIG_PATH;

  try {
    const raw = await readFile(configPath, "utf8");
    const parsed = JSON.parse(raw);

    return {
      listingUrls: Array.isArray(parsed.listingUrls) ? parsed.listingUrls : [],
      searchUrls: Array.isArray(parsed.searchUrls) ? parsed.searchUrls : [],
    };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { listingUrls: [], searchUrls: [] };
    }

    throw error;
  }
}

async function collectTargetUrls(config) {
  const urls = new Set();

  for (const url of config.listingUrls) {
    if (isSahibindenUrl(url)) urls.add(normalizeUrl(url));
  }

  for (const searchUrl of config.searchUrls) {
    if (!isSahibindenUrl(searchUrl)) continue;

    console.log(`[search] ${searchUrl}`);
    const html = await fetchHtml(searchUrl);
    for (const listingUrl of extractListingLinks(searchUrl, html)) {
      urls.add(listingUrl);
    }
    await sleep(randomDelay());
  }

  return Array.from(urls);
}

async function run() {
  const config = await loadConfig();
  const urls = await collectTargetUrls(config);

  if (urls.length === 0) {
    console.log("No FSBO targets found. Create scripts/fsbo-watchlist.json from scripts/fsbo-watchlist.example.json.");
    return;
  }

  const { prisma, pool } = createPrismaClient();
  let checked = 0;
  let urgent = 0;

  try {
    for (const url of urls) {
      console.log(`[check] ${url}`);

      try {
        const html = await fetchHtml(url);
        const parsed = parseListingPage(url, html);
        const result = await upsertListing(prisma, parsed);
        checked += 1;

        if (result.alerts.length > 0) {
          urgent += result.alerts.length;
          console.log(`[urgent] ${result.listing.title ?? url} -> ${result.alerts.map((alert) => alert.reason).join(", ")}`);
        }
      } catch (error) {
        console.error(`[error] ${url}: ${error instanceof Error ? error.message : String(error)}`);
      }

      await sleep(randomDelay());
    }

    console.log(`[done] checked=${checked} urgent_alerts=${urgent}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
