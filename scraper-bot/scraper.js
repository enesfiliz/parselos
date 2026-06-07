import axios from "axios";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import { extractListingLinks, parseListingPage } from "./parse.js";

puppeteer.use(StealthPlugin());

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
];

function randomBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickUserAgent() {
  return USER_AGENTS[randomBetween(0, USER_AGENTS.length - 1)];
}

export async function randomDelay(minMs, maxMs) {
  await sleep(randomBetween(minMs, maxMs));
}

export async function launchStealthBrowser() {
  const headless = process.env.HEADLESS !== "false";

  const browser = await puppeteer.launch({
    headless: headless ? "new" : false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1366,768",
      "--lang=tr-TR,tr",
    ],
    defaultViewport: {
      width: 1366,
      height: 768,
    },
  });

  return browser;
}

export async function createStealthPage(browser) {
  const page = await browser.newPage();
  const userAgent = pickUserAgent();

  await page.setUserAgent(userAgent);
  await page.setExtraHTTPHeaders({
    "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => undefined,
    });
  });

  return page;
}

export async function humanScroll(page) {
  const scrollSteps = randomBetween(3, 6);

  for (let step = 0; step < scrollSteps; step += 1) {
    await page.evaluate(() => {
      const distance = 180 + Math.floor(Math.random() * 320);
      window.scrollBy({ top: distance, behavior: "smooth" });
    });
    await randomDelay(500, 1400);
  }

  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  await randomDelay(400, 900);
}

async function navigateLikeHuman(page, url) {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });

  await randomDelay(
    Number(process.env.MIN_DELAY_MS ?? 1800),
    Number(process.env.MAX_DELAY_MS ?? 4200),
  );

  await humanScroll(page);

  const html = await page.content();
  const blocked = /captcha|cloudflare|attention required|just a moment/i.test(html);

  if (blocked) {
    throw new Error(`Anti-bot engeli algılandı: ${url}`);
  }

  return html;
}

async function scrapeListingDetail(page, url, target) {
  try {
    const html = await navigateLikeHuman(page, url);
    const parsed = parseListingPage(url, html);
    if (!parsed) return null;

    return {
      title: parsed.title,
      price: parsed.price,
      url: parsed.url,
      source: parsed.source ?? target.source ?? "sahibinden",
      images: parsed.images ?? [],
      specs: {
        m2: parsed.metrekare ?? undefined,
        odaSayisi: parsed.odaSayisi ?? undefined,
        ilanNo: parsed.listingNo ?? undefined,
      },
      region: `${target.il}/${target.ilce}`,
      il: target.il,
      ilce: target.ilce,
      location: parsed.location ?? `${target.ilce}, ${target.il}`,
      metrekare: parsed.metrekare,
      odaSayisi: parsed.odaSayisi,
      listingNo: parsed.listingNo,
      islemTipi: target.islemTipi ?? "SATILIK",
      kategori: target.kategori ?? "KONUT",
    };
  } catch (error) {
    console.error(`[scraper-bot] Detay tarama hatası (${url}):`, error.message);
    return null;
  }
}

export async function scrapeTarget(browser, target) {
  const page = await createStealthPage(browser);
  const maxListings = Number(process.env.MAX_LISTINGS_PER_TARGET ?? 12);
  const listings = [];

  try {
    console.log(`[scraper-bot] Arama sayfası: ${target.searchUrl}`);
    const searchHtml = await navigateLikeHuman(page, target.searchUrl);
    const links = extractListingLinks(searchHtml, target.searchUrl, maxListings);

    console.log(`[scraper-bot] ${target.region}: ${links.length} ilan linki bulundu.`);

    for (const link of links) {
      const listing = await scrapeListingDetail(page, link, target);
      if (listing) {
        listings.push(listing);
        console.log(`[scraper-bot] ✓ ${listing.title.slice(0, 48)}…`);
      }

      await randomDelay(
        Number(process.env.MIN_DELAY_MS ?? 1800),
        Number(process.env.MAX_DELAY_MS ?? 4200),
      );
    }
  } finally {
    await page.close();
  }

  return listings;
}

export async function sendToParselos(listings) {
  const apiUrl = process.env.PARSELOS_API_URL?.trim();
  const secret =
    process.env.BOT_SECRET_KEY?.trim() || process.env.BOT_SYNC_SECRET?.trim();

  if (!apiUrl) {
    throw new Error("PARSELOS_API_URL tanımlı değil.");
  }

  if (!secret) {
    throw new Error("BOT_SECRET_KEY tanımlı değil.");
  }

  if (listings.length === 0) {
    console.warn("[scraper-bot] Gönderilecek ilan yok.");
    return { inserted: 0, skipped: 0 };
  }

  const response = await axios.post(
    apiUrl,
    {
      source: "parselos-scraper-bot",
      syncedAt: new Date().toISOString(),
      listings,
    },
    {
      headers: {
        "x-bot-secret": secret,
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
        "User-Agent": "ParselOS-ScraperBot/1.0",
      },
      timeout: 60_000,
    },
  );

  return response.data;
}

export async function runScrapeJob(targets) {
  const browser = await launchStealthBrowser();
  const allListings = [];

  try {
    for (const target of targets) {
      const listings = await scrapeTarget(browser, target);
      allListings.push(...listings);
    }
  } finally {
    await browser.close();
  }

  console.log(`[scraper-bot] Toplam ${allListings.length} ilan ayıklandı.`);

  const result = await sendToParselos(allListings);
  console.log("[scraper-bot] Hostinger API yanıtı:", result);

  return { listings: allListings, apiResult: result };
}
