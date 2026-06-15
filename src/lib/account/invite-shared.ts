export type InvitePreview = {
  code: string;
  valid: boolean;
  error?: string;
  tenantName?: string;
  organizationLabel?: string;
  memberRoleLabel?: string;
  agentRoleLabel?: string;
  expiresAt?: string | null;
  usesRemaining?: number;
  canAccept?: boolean;
  acceptBlockedReason?: string;
};

export function normalizeInviteCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function buildInviteAcceptPath(code: string) {
  return `/invite/${encodeURIComponent(normalizeInviteCode(code))}`;
}

export function buildInviteAcceptUrl(code: string, appUrl?: string) {
  const base = (appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  if (!base) return buildInviteAcceptPath(code);
  return `${base}${buildInviteAcceptPath(code)}`;
}
