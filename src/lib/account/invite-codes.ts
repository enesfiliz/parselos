import "server-only";

import { randomBytes } from "crypto";

import type { AgentRoleType, TenantMemberRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode() {
  const bytes = randomBytes(6);
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return `PSL-${suffix}`;
}

export function normalizeInviteCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export async function findValidInvite(code: string) {
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

  if (!invite || !invite.isActive) return null;
  if (invite.expiresAt && invite.expiresAt < new Date()) return null;
  if (invite.usedCount >= invite.maxUses) return null;

  return invite;
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
