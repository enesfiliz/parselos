import "server-only";

const FETCH_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
};

function isBlockedContent(text: string) {
  return (
    text.length < 200 ||
    /captcha|cloudflare|access denied|bot detection|just a moment|attention required/i.test(
      text,
    )
  );
}

/** Doğrudan site fetch */
export async function fetchListingHtmlDirect(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(14_000),
    });

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return null;
    }

    const html = await response.text();
    if (isBlockedContent(html)) return null;
    return html;
  } catch {
    return null;
  }
}

/**
 * Jina Reader — ücretsiz okuyucu proxy (CAPTCHA'lı sitelerde sık işe yarar).
 * https://jina.ai/reader
 */
export async function fetchListingViaJinaReader(url: string): Promise<string | null> {
  try {
    const readerUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(readerUrl, {
      headers: {
        Accept: "text/html, text/plain, application/json",
        "User-Agent": "ParselOS-ListingImport/1.0",
      },
      signal: AbortSignal.timeout(22_000),
    });

    if (!response.ok) return null;

    const body = await response.text();
    if (isBlockedContent(body)) return null;

    return body;
  } catch {
    return null;
  }
}

/** Microlink.io ücretsiz önizleme — meta title/description */
export async function fetchListingMetaViaMicrolink(
  url: string,
): Promise<{ title?: string; description?: string; image?: string } | null> {
  try {
    const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true`;
    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return null;

    const json = (await response.json()) as {
      status?: string;
      data?: { title?: string; description?: string; image?: { url?: string } };
    };

    if (json.status !== "success" || !json.data) return null;

    return {
      title: json.data.title,
      description: json.data.description,
      image: json.data.image?.url,
    };
  } catch {
    return null;
  }
}

export async function fetchListingContent(url: string): Promise<{
  html: string | null;
  source: "direct" | "jina" | "none";
}> {
  const direct = await fetchListingHtmlDirect(url);
  if (direct) {
    return { html: direct, source: "direct" };
  }

  const jina = await fetchListingViaJinaReader(url);
  if (jina) {
    return { html: jina, source: "jina" };
  }

  return { html: null, source: "none" };
}
