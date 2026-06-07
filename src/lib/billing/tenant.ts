import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import type { TenantPlanType, TenantStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

function tenantDisplayName(agent: {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}) {
  const fullName = [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim();
  if (fullName) return `${fullName} Ofisi`;
  if (agent.email) return agent.email.split("@")[0] ?? "ParselOS Ofisi";
  return "ParselOS Ofisi";
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

  const tenant = await prisma.tenant.create({
    data: {
      name: tenantDisplayName(agent),
      planType: "FREE",
      status: "ACTIVE",
    },
  });

  const updatedAgent = await prisma.agent.update({
    where: { id: agent.id },
    data: { tenantId: tenant.id },
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
        take: 1,
      },
    },
  });

  const clerkUserId = tenant.agents[0]?.clerkUserId;
  if (clerkUserId) {
    await syncTenantPlanToClerk(clerkUserId, tenant.planType, tenant.status);
  }

  return tenant;
}
