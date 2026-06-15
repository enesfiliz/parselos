import "server-only";

import { randomBytes } from "crypto";

import type { AgentRoleType, TenantMemberRole } from "@prisma/client";

import { normalizeInviteCode } from "@/lib/account/invite-shared";
import { prisma } from "@/lib/prisma";

export { normalizeInviteCode, buildInviteAcceptPath, buildInviteAcceptUrl } from "@/lib/account/invite-shared";
export type { InvitePreview } from "@/lib/account/invite-shared";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode() {
  const bytes = randomBytes(6);
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return `PSL-${suffix}`;
}

export async function lookupInvite(code: string) {
  const normalized = normalizeInviteCode(code);
  const invite = await prisma.tenantInvite.findUnique({
    where: { code: normalized },
    include: {
      tenant: {
        include: {
          agents: { select: { id: true } },
        },
      },
    },
  });

  if (!invite) {
    return { ok: false as const, reason: "NOT_FOUND" as const, code: normalized };
  }
  if (!invite.isActive) {
    return { ok: false as const, reason: "CANCELLED" as const, code: normalized, invite };
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return { ok: false as const, reason: "EXPIRED" as const, code: normalized, invite };
  }
  if (invite.usedCount >= invite.maxUses) {
    return { ok: false as const, reason: "USED" as const, code: normalized, invite };
  }

  return { ok: true as const, invite };
}

export async function findValidInvite(code: string) {
  const result = await lookupInvite(code);
  return result.ok ? result.invite : null;
}

export async function createTenantInvite(input: {
  tenantId: string;
  createdByAgentId: string;
  inviteRoleType?: AgentRoleType;
  tenantMemberRole?: TenantMemberRole;
  maxUses?: number;
  expiresInDays?: number;
}) {
  const maxUses = input.maxUses ?? 10;
  const expiresAt = input.expiresInDays
    ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateInviteCode();
    try {
      return await prisma.tenantInvite.create({
        data: {
          tenantId: input.tenantId,
          createdByAgentId: input.createdByAgentId,
          code,
          inviteRoleType: input.inviteRoleType ?? "DANISMAN",
          tenantMemberRole: input.tenantMemberRole ?? "MEMBER",
          maxUses,
          expiresAt,
        },
      });
    } catch {
      // unique collision — retry
    }
  }

  throw new Error("Davet kodu oluşturulamadı.");
}
