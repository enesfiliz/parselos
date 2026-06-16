import "server-only";

import type { Agent, TenantMemberRole } from "@prisma/client";

import {
  canAcceptOfficeInvite,
  getAgentJoinEligibility,
  InviteRedeemError,
  resolveInviteForAccept,
} from "@/lib/account/invite-accept";
import { syncAgentProfileToClerk } from "@/lib/account/sync-profile-metadata";
import { soloFreeTenantDisplayName } from "@/lib/account/tenant-provisioning";
import { prisma } from "@/lib/prisma";

export { InviteRedeemError } from "@/lib/account/invite-accept";

export async function redeemInviteForAgent(agent: Agent, rawCode: string) {
  const invite = await resolveInviteForAccept(rawCode);

  const acceptance = await canAcceptOfficeInvite(agent, invite);
  if (!acceptance.ok) {
    throw new InviteRedeemError(acceptance.code, acceptance.message);
  }

  const eligibility = await getAgentJoinEligibility(agent);

  if (eligibility.willAbandonSoloTenant && agent.tenantId) {
    await prisma.tenant.delete({ where: { id: agent.tenantId } });
  }

  const updatedAgent = await prisma.agent.update({
    where: { id: agent.id },
    data: {
      tenantId: invite.tenantId,
      roleType: invite.inviteRoleType,
      tenantMemberRole: invite.tenantMemberRole,
    },
  });

  await prisma.tenantInvite.update({
    where: { id: invite.id },
    data: { usedCount: { increment: 1 } },
  });

  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: invite.tenantId },
  });

  await syncAgentProfileToClerk(agent.clerkUserId, updatedAgent, tenant);

  return { agent: updatedAgent, tenant };
}

export async function removeAgentFromTenant(
  actorId: string,
  targetAgentId: string,
  tenantId: string,
) {
  const target = await prisma.agent.findFirst({
    where: { id: targetAgentId, tenantId },
  });
  if (!target) throw new Error("Ekip üyesi bulunamadı.");
  if (target.tenantMemberRole === "OWNER") {
    throw new Error("Ofis sahibi kaldırılamaz.");
  }

  const soloTenant = await prisma.tenant.create({
    data: {
      name: soloFreeTenantDisplayName(target),
      planType: "FREE",
      status: "ACTIVE",
      organizationType: "BIREYSEL",
      ownerAgentId: target.id,
    },
  });

  const updated = await prisma.agent.update({
    where: { id: target.id },
    data: {
      tenantId: soloTenant.id,
      tenantMemberRole: "OWNER",
      roleType: "DANISMAN",
    },
    include: { tenant: true },
  });

  await syncAgentProfileToClerk(target.clerkUserId, updated, soloTenant);

  return updated;
}

export async function updateTeamMemberRole(
  tenantId: string,
  targetAgentId: string,
  tenantMemberRole: TenantMemberRole,
) {
  return prisma.agent.update({
    where: { id: targetAgentId, tenantId },
    data: { tenantMemberRole },
  });
}
