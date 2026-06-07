import * as cheerio from "cheerio";

import type { ScrapeResult } from "@/lib/types/scrape";

const SCRAPE_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
};

const MOCK_TITLES = [
  "Kadıköy Moda Deniz Manzaralı 3+1 Daire",
  "Beşiktaş Caddesi Köşe Ticari Dükkan",
  "Çankaya Bahçelievler 4+1 Dubleks",
  "Bornova Ergazi Yeni Bina 2+1",
  "Bodrum Yalıkavak Havuzlu Villa",
  "Nilüfer Görükle Site İçi 3+1",
  "Ataşehir Finans Merkezi Yakını 2+1",
  "Karşıyaka Bostanlı Deniz Manzaralı 1+1",
];

const MOCK_LOCATIONS = [
  "Kadıköy, İstanbul",
  "Beşiktaş, İstanbul",
  "Çankaya, Ankara",
  "Bornova, İzmir",
  "Bodrum, Muğla",
  "Nilüfer, Bursa",
  "Ataşehir, İstanbul",
  "Karşıyaka, İzmir",
];

const SUPPORTED_HOSTS = [
  "sahibinden.com",
  "emlakjet.com",
  "hepsiemlak.com",
] as const;

export function detectListingSource(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("sahibinden")) return "Sahibinden";
    if (host.includes("emlakjet")) return "Emlakjet";
    if (host.includes("hepsiemlak")) return "Hepsiemlak";
    return "Dış Kaynak";
  } catch {
    return "Dış Kaynak";
  }
}

export function isSupportedListingUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return SUPPORTED_HOSTS.some((supported) => host.includes(supported));
  } catch {
    return false;
  }
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function formatTryPrice(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildMockScrapeResult(url: string): ScrapeResult {
  const seed = hashString(url);
  const title = MOCK_TITLES[seed % MOCK_TITLES.length];
  const location = MOCK_LOCATIONS[seed % MOCK_LOCATIONS.length];
  const basePrice = 2_400_000 + (seed % 12) * 275_000;
  const m2 = 72 + (seed % 18) * 8;

  return {
    title,
    price: formatTryPrice(basePrice),
    location,
    m2: String(m2),
    url,
    source: detectListingSource(url),
    mocked: true,
  };
}

function firstNonEmpty(...values: (string | undefined | null)[]): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

function extractPriceFromText(text: string): string {
  const patterns = [
    /(\d{1,3}(?:\.\d{3})+)\s*(?:TL|₺)/i,
    /(?:TL|₺)\s*(\d{1,3}(?:\.\d{3})+)/i,
    /(\d{1,3}(?:\.\d{3})+)\s*TL/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const digits = match[1].replace(/[^\d]/g, "");
      const amount = Number(digits);
      if (!Number.isNaN(amount) && amount > 10_000) {
        return formatTryPrice(amount);
      }
    }
  }

  return "";
}

function extractM2FromText(text: string): string {
  const patterns = [
    /(\d{2,4})\s*m[²2]/i,
    /m[²2]\s*[:\-]?\s*(\d{2,4})/i,
    /metrekare\s*[:\-]?\s*(\d{2,4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
}

function extractLocationFromText(text: string): string {
  const cityMatch = text.match(
    /([A-Za-zÇĞİÖŞÜçğıöşü\s]+),\s*(İstanbul|Ankara|İzmir|Bursa|Antalya|Muğla|Adana|Konya)/i,
  );
  if (cityMatch) {
    return `${cityMatch[1].trim()}, ${cityMatch[2]}`;
  }
  return "";
}

function scrapeFromHtml(url: string, html: string): Partial<ScrapeResult> {
  const $ = cheerio.load(html);
  const source = detectListingSource(url);
  const bodyText = $("body").text().replace(/\s+/g, " ");

  const ogTitle = $('meta[property="og:title"]').attr("content");
  const pageTitle = $("title").text();
  const h1 = $("h1").first().text();

  const siteTitleSelectors: Record<string, string[]> = {
    Sahibinden: [
      ".classifiedDetailTitle",
      "h1.classified-title",
      "[data-testid='classified-title']",
    ],
    Emlakjet: ["h1.listing-title", ".listing-detail-title h1", "h1"],
    Hepsiemlak: ["h1.detail-title", ".listing-title", "h1"],
  };

  let siteTitle = "";
  for (const selector of siteTitleSelectors[source] ?? ["h1"]) {
    const text = $(selector).first().text().trim();
    if (text) {
      siteTitle = text;
      break;
    }
  }

  const title = firstNonEmpty(siteTitle, ogTitle, h1, pageTitle);

  const priceSelectors: Record<string, string[]> = {
    Sahibinden: [
      ".classified-price-wrapper",
      "h3.price",
      "[data-testid='price']",
      ".price",
    ],
    Emlakjet: [".price-wrapper", ".listing-price", "[data-testid='price']"],
    Hepsiemlak: [".price", ".listing-price", "[data-testid='price']"],
  };

  let price = "";
  for (const selector of priceSelectors[source] ?? [".price"]) {
    const text = $(selector).first().text();
    price = extractPriceFromText(text);
    if (price) break;
  }
  if (!price) {
    price = extractPriceFromText(bodyText.slice(0, 8_000));
  }

  const ogDescription = $('meta[property="og:description"]').attr("content");
  const breadcrumb = $(
    ".breadcrumb, [class*='breadcrumb'], nav[aria-label='breadcrumb']",
  )
    .first()
    .text()
    .replace(/\s+/g, " ");

  const location = firstNonEmpty(
    extractLocationFromText(breadcrumb),
    extractLocationFromText(ogDescription ?? ""),
    extractLocationFromText(bodyText.slice(0, 4_000)),
  );

  let m2 = extractM2FromText(bodyText.slice(0, 10_000));
  if (!m2) {
    const detailRows = $("li, td, span, div")
      .toArray()
      .map((el) => $(el).text().replace(/\s+/g, " "))
      .filter((text) => /m[²2]|metrekare/i.test(text));
    for (const row of detailRows) {
      m2 = extractM2FromText(row);
      if (m2) break;
    }
  }

  return { title, price, location, m2, url, source };
}

function isCompleteResult(
  partial: Partial<ScrapeResult>,
): partial is Omit<ScrapeResult, "mocked"> {
  return Boolean(
    partial.title && partial.price && partial.url && partial.source,
  );
}

export async function scrapeListingUrl(url: string): Promise<ScrapeResult> {
  const normalizedUrl = url.trim();

  try {
    const response = await fetch(normalizedUrl, {
      headers: SCRAPE_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      return buildMockScrapeResult(normalizedUrl);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return buildMockScrapeResult(normalizedUrl);
    }

    const html = await response.text();

    if (
      html.length < 500 ||
      /captcha|cloudflare|access denied|bot detection/i.test(html)
    ) {
      return buildMockScrapeResult(normalizedUrl);
    }

    const partial = scrapeFromHtml(normalizedUrl, html);

    if (!isCompleteResult(partial)) {
      const mock = buildMockScrapeResult(normalizedUrl);
      return {
        title: partial.title || mock.title,
        price: partial.price || mock.price,
        location: partial.location || mock.location,
        m2: partial.m2 || mock.m2,
        url: normalizedUrl,
        source: partial.source || mock.source,
        mocked: !(partial.title && partial.price),
      };
    }

    return {
      title: partial.title,
      price: partial.price,
      location: partial.location || "Belirtilmedi",
      m2: partial.m2 || "—",
      url: normalizedUrl,
      source: partial.source,
      mocked: false,
    };
  } catch {
    return buildMockScrapeResult(normalizedUrl);
  }
}
