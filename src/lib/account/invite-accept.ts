import "server-only";

import type { Agent, Tenant, TenantInvite } from "@prisma/client";

import { lookupInvite, normalizeInviteCode } from "@/lib/account/invite-codes";
import type { InvitePreview } from "@/lib/account/invite-shared";
import { AGENT_ROLE_LABELS, ORGANIZATION_TYPE_LABELS } from "@/lib/account/labels";
import {
  isBrokerOfficeTenant,
  memberRoleLabel,
} from "@/lib/account/permissions";
import { prisma } from "@/lib/prisma";

export type { InvitePreview } from "@/lib/account/invite-shared";

export type AgentJoinEligibility = {
  canJoin: boolean;
  reason?: string;
  willAbandonSoloTenant?: boolean;
};

export type InviteRejectReason =
  | "NOT_FOUND"
  | "CANCELLED"
  | "EXPIRED"
  | "USED"
  | "NOT_BROKER_OFFICE"
  | "ALREADY_MEMBER"
  | "BLOCKED";

export class InviteRedeemError extends Error {
  readonly code: InviteRejectReason;

  constructor(code: InviteRejectReason, message: string) {
    super(message);
    this.name = "InviteRedeemError";
    this.code = code;
  }
}

const INVITE_ERROR_MESSAGES: Record<
  Exclude<InviteRejectReason, "ALREADY_MEMBER" | "BLOCKED">,
  string
> = {
  NOT_FOUND: "Davet bulunamadı.",
  CANCELLED: "Davet iptal edilmiş.",
  EXPIRED: "Davet süresi dolmuş.",
  USED: "Davet kullanım limitine ulaşmış.",
  NOT_BROKER_OFFICE: "Bu davet geçerli bir Broker Ofis daveti değil.",
};

export function inviteLookupErrorMessage(
  reason: Exclude<InviteRejectReason, "ALREADY_MEMBER" | "BLOCKED">,
) {
  return INVITE_ERROR_MESSAGES[reason];
}

export async function getAgentJoinEligibility(
  agent: Pick<Agent, "id" | "tenantId" | "tenantMemberRole">,
): Promise<AgentJoinEligibility> {
  if (!agent.tenantId) {
    return { canJoin: true };
  }

  const currentTenant = await prisma.tenant.findUnique({
    where: { id: agent.tenantId },
    include: { agents: { select: { id: true } } },
  });

  if (!currentTenant) {
    return { canJoin: true };
  }

  const isSoloOwner =
    currentTenant.ownerAgentId === agent.id && currentTenant.agents.length === 1;

  if (agent.tenantMemberRole === "OWNER") {
    if (isSoloOwner && currentTenant.organizationType === "BIREYSEL") {
      return { canJoin: true, willAbandonSoloTenant: true };
    }

    if (isSoloOwner) {
      return {
        canJoin: false,
        reason:
          "Kendi ofisiniz aktif. Başka bir ofise katılmadan önce mevcut ofisinizi kapatmanız gerekir.",
      };
    }

    return {
      canJoin: false,
      reason:
        "Ofis sahibi olarak başka bir ofise katılamazsınız. Önce mevcut ofisteki üyeleri yönetin.",
    };
  }

  if (agent.tenantMemberRole === "MANAGER") {
    return {
      canJoin: false,
      reason:
        "Yönetici olarak başka bir ofise katılmak için önce mevcut ofis bağlantınızı kaldırmanız gerekir.",
    };
  }

  if (
    isBrokerOfficeTenant(currentTenant) &&
    agent.tenantId === currentTenant.id
  ) {
    return {
      canJoin: false,
      reason: "Zaten bir Broker Ofise bağlısınız.",
    };
  }

  return {
    canJoin: false,
    reason: "Başka bir ofise katılmak için önce mevcut ofisten ayrılmanız gerekir.",
  };
}

type ResolvedInvite = TenantInvite & {
  tenant: Tenant & { agents: { id: string }[] };
};

export async function canAcceptOfficeInvite(
  agent: Pick<Agent, "id" | "tenantId" | "tenantMemberRole">,
  invite: ResolvedInvite,
): Promise<{ ok: true } | { ok: false; code: InviteRejectReason; message: string }> {
  if (!isBrokerOfficeTenant(invite.tenant)) {
    return {
      ok: false,
      code: "NOT_BROKER_OFFICE",
      message: INVITE_ERROR_MESSAGES.NOT_BROKER_OFFICE,
    };
  }

  if (invite.tenant.status !== "ACTIVE") {
    return {
      ok: false,
      code: "NOT_BROKER_OFFICE",
      message: "Davet eden ofis şu an aktif değil.",
    };
  }

  if (invite.tenantMemberRole === "OWNER") {
    return {
      ok: false,
      code: "BLOCKED",
      message: "Bu davet güvenli şekilde kabul edilemiyor.",
    };
  }

  if (agent.tenantId === invite.tenantId) {
    return {
      ok: false,
      code: "ALREADY_MEMBER",
      message: "Zaten bu ofisin üyesisiniz.",
    };
  }

  const eligibility = await getAgentJoinEligibility(agent);
  if (!eligibility.canJoin) {
    return {
      ok: false,
      code: "BLOCKED",
      message: eligibility.reason ?? "Bu davet kabul edilemiyor.",
    };
  }

  return { ok: true };
}

export async function resolveInviteForAccept(rawCode: string) {
  const lookup = await lookupInvite(rawCode);
  if (!lookup.ok) {
    throw new InviteRedeemError(
      lookup.reason,
      inviteLookupErrorMessage(lookup.reason),
    );
  }

  if (!isBrokerOfficeTenant(lookup.invite.tenant)) {
    throw new InviteRedeemError(
      "NOT_BROKER_OFFICE",
      INVITE_ERROR_MESSAGES.NOT_BROKER_OFFICE,
    );
  }

  return lookup.invite;
}

export async function buildInvitePreview(
  rawCode: string,
  agent: Pick<Agent, "id" | "tenantId" | "tenantMemberRole"> | null,
): Promise<InvitePreview> {
  const code = normalizeInviteCode(rawCode);
  const lookup = await lookupInvite(code);

  if (!lookup.ok) {
    return {
      code,
      valid: false,
      error: inviteLookupErrorMessage(lookup.reason),
    };
  }

  const invite = lookup.invite;
  const usesRemaining = invite.maxUses - invite.usedCount;
  const base: InvitePreview = {
    code: invite.code,
    valid: true,
    tenantName: invite.tenant.name,
    organizationLabel: ORGANIZATION_TYPE_LABELS[invite.tenant.organizationType],
    memberRoleLabel: memberRoleLabel(invite.tenantMemberRole),
    agentRoleLabel: AGENT_ROLE_LABELS[invite.inviteRoleType],
    expiresAt: invite.expiresAt?.toISOString() ?? null,
    usesRemaining,
  };

  if (!agent) {
    return {
      ...base,
      canAccept: false,
      acceptBlockedReason: "Bu daveti kabul etmek için giriş yapmalısınız.",
    };
  }

  const acceptance = await canAcceptOfficeInvite(agent, invite);
  if (!acceptance.ok) {
    return {
      ...base,
      canAccept: false,
      acceptBlockedReason: acceptance.message,
    };
  }

  return { ...base, canAccept: true };
}
