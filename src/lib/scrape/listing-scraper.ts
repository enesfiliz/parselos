import * as cheerio from "cheerio";

import {
  fetchListingContent,
  fetchListingMetaViaMicrolink,
} from "@/lib/scrape/listing-fetcher";
import type { ScrapeResult } from "@/lib/types/scrape";

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
    images: [],
    mocked: true,
  };
}

function absolutizeImageUrl(baseUrl: string, src: string): string | null {
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith("data:")) return null;
  try {
    if (trimmed.startsWith("//")) {
      return `https:${trimmed}`;
    }
    if (trimmed.startsWith("http")) return trimmed;
    return new URL(trimmed, baseUrl).href;
  } catch {
    return null;
  }
}

function isLikelyListingImage(url: string): boolean {
  if (/logo|icon|avatar|sprite|badge|1x1|pixel|favicon|placeholder/i.test(url)) {
    return false;
  }
  if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url)) return true;
  if (
    /sahibinden\.com|emlakjet\.com|hepsiemlak\.com|cloudfront|akamaized|cdn|\/image|\/photo|\/classified/i.test(
      url,
    )
  ) {
    return true;
  }
  return false;
}

function normalizeImageList(baseUrl: string, candidates: string[]): string[] {
  const seen = new Set<string>();
  for (const raw of candidates) {
    const abs = absolutizeImageUrl(baseUrl, raw);
    if (abs && !seen.has(abs) && isLikelyListingImage(abs)) {
      seen.add(abs);
    }
  }
  return [...seen].slice(0, 8);
}

function extractImagesFromCheerio(
  $: ReturnType<typeof cheerio.load>,
  pageUrl: string,
): string[] {
  const candidates: string[] = [];

  const og = $('meta[property="og:image"]').attr("content");
  if (og) candidates.push(og);

  const twitter = $('meta[name="twitter:image"]').attr("content");
  if (twitter) candidates.push(twitter);

  const selectors = [
    "img.stdImg",
    ".classifiedDetailPhotos img",
    "[class*='gallery'] img",
    "[data-testid*='photo'] img",
    ".swiper-slide img",
    ".listing-image img",
  ];

  for (const selector of selectors) {
    $(selector).each((_, el) => {
      const src =
        $(el).attr("src") ||
        $(el).attr("data-src") ||
        $(el).attr("data-original");
      if (src) candidates.push(src);
    });
  }

  return normalizeImageList(pageUrl, candidates);
}

function extractImagesFromMarkdown(pageUrl: string, markdown: string): string[] {
  const candidates: string[] = [];
  for (const match of markdown.matchAll(
    /!\[[^\]]*]\((https?:\/\/[^)]+)\)/gi,
  )) {
    candidates.push(match[1]);
  }
  for (const match of markdown.matchAll(
    /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/gi,
  )) {
    candidates.push(match[0]);
  }
  return normalizeImageList(pageUrl, candidates);
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

  const images = extractImagesFromCheerio($, url);

  return { title, price, location, m2, url, source, images };
}

function isCompleteResult(
  partial: Partial<ScrapeResult>,
): partial is Omit<ScrapeResult, "mocked"> {
  return Boolean(
    partial.title && partial.price && partial.url && partial.source,
  );
}

const BLOCKED_SOURCE_MESSAGE =
  "Kaynak erişimi engellendi (CAPTCHA / bot koruması). İlanı tarayıcıda açıp linki buraya yapıştırın veya kendi scraper-bot sunucunuzu kullanın.";

export type ScrapeListingOptions = {
  /** false: mock veri dönmez, hata fırlatır (FSBO içe aktarma) */
  allowMock?: boolean;
  /** Kullanıcı beyanı — otomatik çekim başarısızsa kullanılır */
  manual?: {
    title?: string;
    price?: string | number;
    location?: string;
    m2?: string | number;
    imageUrl?: string;
  };
};

function parseJinaMarkdown(url: string, markdown: string): Partial<ScrapeResult> {
  const source = detectListingSource(url);
  const lines = markdown.split("\n").map((l) => l.trim()).filter(Boolean);

  let title = "";
  for (const line of lines.slice(0, 8)) {
    const heading = line.replace(/^#+\s*/, "").trim();
    if (heading.length > 8 && !/sahibinden|emlakjet|hepsiemlak/i.test(heading)) {
      title = heading;
      break;
    }
  }

  const bodyText = markdown.replace(/\s+/g, " ");
  const price = extractPriceFromText(bodyText);
  const location = extractLocationFromText(bodyText) || extractLocationFromText(title);
  const m2 = extractM2FromText(bodyText);
  const images = extractImagesFromMarkdown(url, markdown);

  return { title, price, location, m2, url, source, images };
}

function mergeManual(
  partial: Partial<ScrapeResult>,
  manual: ScrapeListingOptions["manual"],
  url: string,
): Partial<ScrapeResult> {
  if (!manual) return partial;

  const price =
    manual.price !== undefined
      ? typeof manual.price === "number"
        ? formatTryPrice(manual.price)
        : manual.price.trim()
      : partial.price;

  const manualImages = manual.imageUrl?.trim()
    ? normalizeImageList(url, [manual.imageUrl.trim()])
    : [];

  return {
    ...partial,
    title: manual.title?.trim() || partial.title,
    price: price || partial.price,
    location: manual.location?.trim() || partial.location,
    m2:
      manual.m2 !== undefined
        ? String(manual.m2)
        : partial.m2,
    images:
      manualImages.length > 0
        ? normalizeImageList(url, [...manualImages, ...(partial.images ?? [])])
        : partial.images,
    url,
    source: partial.source || detectListingSource(url),
  };
}

export async function scrapeListingUrl(
  url: string,
  options?: ScrapeListingOptions,
): Promise<ScrapeResult> {
  const normalizedUrl = url.trim();
  const allowMock = options?.allowMock !== false;

  try {
    const { html, source: fetchSource } = await fetchListingContent(normalizedUrl);

    let partial: Partial<ScrapeResult> = {};

    if (html) {
      partial =
        fetchSource === "jina"
          ? parseJinaMarkdown(normalizedUrl, html)
          : scrapeFromHtml(normalizedUrl, html);
    }

    if (!partial.title || !partial.price || !partial.images?.length) {
      const meta = await fetchListingMetaViaMicrolink(normalizedUrl);
      if (meta?.title && !partial.title) partial.title = meta.title;
      if (meta?.image) {
        partial.images = normalizeImageList(normalizedUrl, [
          ...(partial.images ?? []),
          meta.image,
        ]);
      }
      if (meta?.description) {
        if (!partial.price) partial.price = extractPriceFromText(meta.description);
        if (!partial.location) {
          partial.location = extractLocationFromText(meta.description);
        }
      }
    }

    partial = mergeManual(partial, options?.manual, normalizedUrl);

    if (!isCompleteResult(partial)) {
      if (options?.manual?.title && options?.manual?.price) {
        const manualPrice =
          typeof options.manual.price === "number"
            ? formatTryPrice(options.manual.price)
            : options.manual.price;
        return {
          title: options.manual.title,
          price: manualPrice,
          location: options.manual.location || partial.location || "Belirtilmedi",
          m2: options.manual.m2 ? String(options.manual.m2) : partial.m2 || "—",
          url: normalizedUrl,
          source: partial.source || detectListingSource(normalizedUrl),
          images: partial.images ?? [],
          mocked: false,
        };
      }

      if (!allowMock) {
        throw new Error(
          partial.title
            ? "Fiyat okunamadı. Aşağıdaki manuel alanları doldurun."
            : `${BLOCKED_SOURCE_MESSAGE} Manuel başlık ve fiyat girebilirsiniz.`,
        );
      }

      const mock = buildMockScrapeResult(normalizedUrl);
      return {
        title: partial.title || mock.title,
        price: partial.price || mock.price,
        location: partial.location || mock.location,
        m2: partial.m2 || mock.m2,
        url: normalizedUrl,
        source: partial.source || mock.source,
        images: partial.images ?? mock.images,
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
      images: partial.images ?? [],
      mocked: false,
    };
  } catch (error) {
    if (options?.manual?.title && options?.manual?.price) {
      const manualPrice =
        typeof options.manual.price === "number"
          ? formatTryPrice(options.manual.price)
          : options.manual.price;
      const manualImages = options.manual.imageUrl?.trim()
        ? normalizeImageList(normalizedUrl, [options.manual.imageUrl.trim()])
        : [];
      return {
        title: options.manual.title,
        price: manualPrice,
        location: options.manual.location || "Belirtilmedi",
        m2: options.manual.m2 ? String(options.manual.m2) : "—",
        url: normalizedUrl,
        source: detectListingSource(normalizedUrl),
        images: manualImages,
        mocked: false,
      };
    }

    if (!allowMock) {
      throw error instanceof Error ? error : new Error(BLOCKED_SOURCE_MESSAGE);
    }
    return buildMockScrapeResult(normalizedUrl);
  }
}
