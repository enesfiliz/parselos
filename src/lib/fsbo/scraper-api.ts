import "server-only";

const SCRAPER_API_BASE = "https://api.scraperapi.com";

export function hasScraperApiKey(): boolean {
  return Boolean(process.env.SCRAPER_API_KEY?.trim());
}

export async function fetchHtmlViaScraperApi(
  targetUrl: string,
): Promise<string | null> {
  const apiKey = process.env.SCRAPER_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "[fsbo-sync] SCRAPER_API_KEY tanımlı değil. .env.local dosyasına ekleyin.",
    );
    return null;
  }

  const timeoutMs = Number(process.env.FSBO_REQUEST_TIMEOUT_MS ?? 30_000);

  const params = new URLSearchParams({
    api_key: apiKey,
    url: targetUrl,
    country_code: "tr",
  });

  if (process.env.FSBO_SCRAPER_RENDER === "true") {
    params.set("render", "true");
  }

  if (targetUrl.includes("sahibinden.com")) {
    params.set("premium", "true");
  }

  try {
    const response = await fetch(`${SCRAPER_API_BASE}?${params.toString()}`, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `[fsbo-sync] ScraperAPI HTTP ${response.status} — ${targetUrl}`,
      );
      return null;
    }

    const html = await response.text();

    if (html.length < 500) {
      console.error(
        `[fsbo-sync] ScraperAPI boş veya çok kısa yanıt döndü — ${targetUrl}`,
      );
      return null;
    }

    if (/captcha|rate limit|access denied|bot detection|cloudflare/i.test(html)) {
      console.error(
        `[fsbo-sync] ScraperAPI anti-bot veya limit yanıtı — ${targetUrl}`,
      );
      return null;
    }

    return html;
  } catch (error) {
    console.error("[fsbo-sync] ScraperAPI isteği başarısız:", error);
    return null;
  }
}
