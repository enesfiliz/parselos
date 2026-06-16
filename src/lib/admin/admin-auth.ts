import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "parsel_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.CLERK_SECRET_KEY ??
    "parsel-dev-admin-session-secret"
  );
}

export function getConfiguredAdminPassword(): string | null {
  const password = process.env.ADMIN_ACCESS_PASSWORD?.trim();
  return password || null;
}

export function logAdminPasswordMisconfiguration(context: string) {
  if (getConfiguredAdminPassword()) return;

  const message = `[admin] ${context}: ADMIN_ACCESS_PASSWORD is not set; super admin login is disabled.`;
  if (process.env.NODE_ENV === "production") {
    console.error(message);
  } else {
    console.warn(message);
  }
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getConfiguredAdminPassword();
  if (!expected) return false;
  return safeEqual(password.trim(), expected);
}

export function createAdminSessionToken() {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${expiresAt}`;
  const signature = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex");
  return `${expiresAt}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) return false;

  const [expiresRaw, signature] = token.split(".");
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  if (!signature) return false;

  const payload = `admin:${expiresAt}`;
  const expected = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex");

  return safeEqual(signature, expected);
}
