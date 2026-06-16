import "server-only";

import type { TenantPlanType, TenantStatus } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";

import { syncAgentProfileToClerk } from "@/lib/account/sync-profile-metadata";
import {
  createDefaultFreeTenantForAgent,
  ensureBrokerOfficeForAllowlistedAgent,
  ensureSoloFreeTenantIntegrity,
  revertUnauthorizedBrokerProvisioning,
} from "@/lib/account/tenant-provisioning";
import { prisma } from "@/lib/prisma";

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

  if (!agent.tenant) {
    const provisioned = await createDefaultFreeTenantForAgent(agent);
    await syncTenantPlanToClerk(
      provisioned.agent.clerkUserId,
      provisioned.tenant.planType,
      provisioned.tenant.status,
    );
    await syncAgentProfileToClerk(
      provisioned.agent.clerkUserId,
      provisioned.agent,
      provisioned.tenant,
    );

    const allowlisted = await ensureBrokerOfficeForAllowlistedAgent(
      provisioned.agent,
      provisioned.tenant,
    );
    if (allowlisted.changed) {
      await syncTenantPlanToClerk(
        allowlisted.agent.clerkUserId,
        allowlisted.tenant.planType,
        allowlisted.tenant.status,
      );
      await syncAgentProfileToClerk(
        allowlisted.agent.clerkUserId,
        allowlisted.agent,
        allowlisted.tenant,
      );
      return { agent: allowlisted.agent, tenant: allowlisted.tenant };
    }

    return provisioned;
  }

  const reverted = await revertUnauthorizedBrokerProvisioning(agent, agent.tenant);
  const integrity = await ensureSoloFreeTenantIntegrity(
    reverted.agent,
    reverted.tenant,
  );
  const brokered = await ensureBrokerOfficeForAllowlistedAgent(
    integrity.agent,
    integrity.tenant,
  );

  const finalAgent = brokered.agent;
  const finalTenant = brokered.tenant;

  if (reverted.changed || integrity.changed || brokered.changed) {
    await syncTenantPlanToClerk(
      finalAgent.clerkUserId,
      finalTenant.planType,
      finalTenant.status,
    );
    await syncAgentProfileToClerk(finalAgent.clerkUserId, finalAgent, finalTenant);
  }

  return { agent: finalAgent, tenant: finalTenant };
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
