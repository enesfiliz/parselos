const DEFAULT_BROKER_OWNER_EMAIL = "enesfiliz7@gmail.com";

/** Production allowlist — yalnızca bu e-postalar ödeme dışı Broker Ofis kalabilir. */
export function getBrokerOwnerEmails(): string[] {
  const raw = process.env.BROKER_OWNER_EMAILS?.trim();
  if (!raw) {
    return [DEFAULT_BROKER_OWNER_EMAIL];
  }

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isBrokerOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getBrokerOwnerEmails().includes(email.trim().toLowerCase());
}
