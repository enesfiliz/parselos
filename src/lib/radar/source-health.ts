import { unstable_cache } from "next/cache";

export type SourceHealthStatus =
  | "healthy"
  | "unavailable"
  | "expired"
  | "unchecked";

export type SourceHealthResult = {
  status: SourceHealthStatus;
  httpStatus: number | null;
  lastCheckedAt: string;
  allowlisted: boolean;
};

const ALLOWED_HOST_SUFFIXES = [".bel.tr", ".gov.tr"] as const;

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
]);

const PRIVATE_IPV4_RANGES = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^0\./,
];

const FETCH_TIMEOUT_MS = 8_000;
const MAX_REDIRECTS = 3;

function isPrivateIpv4(hostname: string): boolean {
  return PRIVATE_IPV4_RANGES.some((pattern) => pattern.test(hostname));
}

export function isAllowlistedOfficialHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTNAMES.has(host)) return false;
  if (isPrivateIpv4(host)) return false;
  if (host.endsWith(".local")) return false;
  return ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

export function isSafeRadarHealthUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    return isAllowlistedOfficialHost(url.hostname);
  } catch {
    return false;
  }
}

async function fetchWithRedirects(
  url: string,
  method: "HEAD" | "GET",
  redirects = 0,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      redirect: "manual",
      signal: controller.signal,
      headers: method === "GET" ? { Range: "bytes=0-0" } : undefined,
    });

    if (
      response.status >= 300 &&
      response.status < 400 &&
      redirects < MAX_REDIRECTS
    ) {
      const location = response.headers.get("location");
      if (!location) return response;
      const nextUrl = new URL(location, url).href;
      if (!isSafeRadarHealthUrl(nextUrl)) {
        return response;
      }
      return fetchWithRedirects(nextUrl, method, redirects + 1);
    }

    return response;
  } finally {
    clearTimeout(timer);
  }
}

function mapHttpStatusToHealth(status: number): SourceHealthStatus {
  if (status >= 200 && status < 400) return "healthy";
  if (status === 404 || status === 410) return "unavailable";
  if (status >= 400) return "unavailable";
  return "unchecked";
}

export async function checkSourceHealth(url: string): Promise<SourceHealthResult> {
  const checkedAt = new Date().toISOString();

  if (!isSafeRadarHealthUrl(url)) {
    return {
      status: "unchecked",
      httpStatus: null,
      lastCheckedAt: checkedAt,
      allowlisted: false,
    };
  }

  try {
    let response = await fetchWithRedirects(url, "HEAD");
    if (response.status === 405 || response.status === 501) {
      response = await fetchWithRedirects(url, "GET");
    }

    return {
      status: mapHttpStatusToHealth(response.status),
      httpStatus: response.status,
      lastCheckedAt: checkedAt,
      allowlisted: true,
    };
  } catch {
    return {
      status: "unavailable",
      httpStatus: null,
      lastCheckedAt: checkedAt,
      allowlisted: true,
    };
  }
}

export function getCachedSourceHealth(url: string) {
  const cacheKey = `source-health:${url}`;
  return unstable_cache(
    () => checkSourceHealth(url),
    [cacheKey],
    { revalidate: 3600 },
  )();
}
