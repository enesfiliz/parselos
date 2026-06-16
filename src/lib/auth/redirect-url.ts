const INTERNAL_ORIGIN = "https://parselos.internal";

export function isSafeInternalRedirect(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  // Leading/trailing whitespace can hide malicious payloads.
  if (url !== url.trim()) {
    return false;
  }

  if (!url.startsWith("/") || url.startsWith("//")) {
    return false;
  }

  try {
    const parsed = new URL(url, INTERNAL_ORIGIN);
    return parsed.origin === INTERNAL_ORIGIN && parsed.pathname.startsWith("/");
  } catch {
    return false;
  }
}

export function getSafeInternalRedirect(
  redirectUrl: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!redirectUrl) {
    return fallback;
  }

  return isSafeInternalRedirect(redirectUrl) ? redirectUrl : fallback;
}
