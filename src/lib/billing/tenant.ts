import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import type {
  AgentRoleType,
  TenantOrganizationType,
  TenantPlanType,
  TenantStatus,
} from "@prisma/client";

import { ROLE_TO_ORG_DEFAULT } from "@/lib/account/labels";
import { prisma } from "@/lib/prisma";

function tenantDisplayName(agent: {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  roleType?: AgentRoleType;
}) {
  const fullName = [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim();
  if (agent.roleType === "BROKER" && fullName) return `${fullName} Brokerlık`;
  if (fullName) return `${fullName} Ofisi`;
  if (agent.email) return agent.email.split("@")[0] ?? "ParselOS Ofisi";
  return "ParselOS Ofisi";
}

function defaultOrgType(roleType: AgentRoleType): TenantOrganizationType {
  return ROLE_TO_ORG_DEFAULT[roleType];
}

export async function syncTenantPlanToClerk(
  clerkUserId: string,
  planType: TenantPlanType,
  status: TenantStatus,
) {
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        planType,
        tenantStatus: status,
        planSyncedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[syncTenantPlanToClerk]", clerkUserId, error);
  }
}

export async function getOrCreateTenantForAgent(agentId: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { tenant: true },
  });

  if (!agent) {
    throw new Error("Danışman kaydı bulunamadı.");
  }

  if (agent.tenant) {
    return { agent, tenant: agent.tenant };
  }

  const isOfficeLead = agent.roleType === "BROKER" || agent.roleType === "KURULUS";
  const organizationType = defaultOrgType(agent.roleType);

  const tenant = await prisma.tenant.create({
    data: {
      name: tenantDisplayName(agent),
      planType: "FREE",
      status: "ACTIVE",
      organizationType,
      ownerAgentId: isOfficeLead ? agent.id : null,
    },
  });

  const updatedAgent = await prisma.agent.update({
    where: { id: agent.id },
    data: {
      tenantId: tenant.id,
      tenantMemberRole: isOfficeLead ? "OWNER" : "OWNER",
    },
    include: { tenant: true },
  });

  await syncTenantPlanToClerk(agent.clerkUserId, tenant.planType, tenant.status);

  return { agent: updatedAgent, tenant };
}

export async function getTenantPlanForClerkUser(clerkUserId: string) {
  const agent = await prisma.agent.findUnique({
    where: { clerkUserId },
    include: { tenant: true },
  });

  if (!agent?.tenant) {
    return {
      planType: "FREE" as TenantPlanType,
      status: "ACTIVE" as TenantStatus,
      tenantId: null as string | null,
    };
  }

  return {
    planType: agent.tenant.planType,
    status: agent.tenant.status,
    tenantId: agent.tenant.id,
  };
}

export async function updateTenantSubscriptionState(input: {
  tenantId: string;
  planType: TenantPlanType;
  status: TenantStatus;
  iyzicoSubscriptionReference?: string | null;
  iyzicoPricingPlanReference?: string | null;
  iyzicoCustomerReference?: string | null;
}) {
  const tenant = await prisma.tenant.update({
    where: { id: input.tenantId },
    data: {
      planType: input.planType,
      status: input.status,
      iyzicoSubscriptionReference:
        input.iyzicoSubscriptionReference ?? undefined,
      iyzicoPricingPlanReference:
        input.iyzicoPricingPlanReference ?? undefined,
      iyzicoCustomerReference: input.iyzicoCustomerReference ?? undefined,
    },
    include: {
      agents: {
        select: { clerkUserId: true },
      },
    },
  });

  await Promise.all(
    tenant.agents.map((member) =>
      syncTenantPlanToClerk(member.clerkUserId, tenant.planType, tenant.status),
    ),
  );

  return tenant;
}
