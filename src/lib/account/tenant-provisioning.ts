import type { Agent, Tenant } from "@prisma/client";

import { isBrokerOwnerEmail } from "@/lib/account/broker-owner";
import { isBrokerOfficeTenant } from "@/lib/account/permissions";
import { prisma } from "@/lib/prisma";

export function soloFreeTenantDisplayName(
  agent: Pick<Agent, "firstName" | "lastName" | "email">,
) {
  const fullName = [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim();
  if (fullName) return `${fullName} — Bireysel`;
  if (agent.email) return `${agent.email.split("@")[0]} — Bireysel`;
  return "ParselOS Bireysel";
}

export function brokerOfficeTenantDisplayName(
  agent: Pick<Agent, "firstName" | "lastName" | "email">,
) {
  const fullName = [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim();
  if (fullName) return `${fullName} Brokerlık`;
  if (agent.email) return `${agent.email.split("@")[0]} Brokerlık`;
  return "ParselOS Brokerlık";
}

export function isPaidBrokerSubscription(tenant: Pick<Tenant, "iyzicoSubscriptionReference">) {
  return Boolean(tenant.iyzicoSubscriptionReference?.trim());
}

/**
 * Ödeme yapmadan broker/ofis planında kalan hesapları FREE bireysel'e çeker.
 * Allowlist ve aktif iyzico aboneliği hariç.
 */
export async function revertUnauthorizedBrokerProvisioning(
  agent: Agent,
  tenant: Tenant,
): Promise<{ agent: Agent; tenant: Tenant; changed: boolean }> {
  if (isBrokerOwnerEmail(agent.email)) {
    return { agent, tenant, changed: false };
  }

  if (isPaidBrokerSubscription(tenant)) {
    return { agent, tenant, changed: false };
  }

  const looksLikeBrokerOffice =
    isBrokerOfficeTenant(tenant) ||
    tenant.organizationType === "BROKERLIK" ||
    tenant.organizationType === "OFIS" ||
    agent.roleType === "BROKER";

  if (!looksLikeBrokerOffice && tenant.planType === "FREE" && tenant.organizationType === "BIREYSEL") {
    return { agent, tenant, changed: false };
  }

  const teamSize = await prisma.agent.count({ where: { tenantId: tenant.id } });
  if (teamSize > 1) {
    return { agent, tenant, changed: false };
  }

  const [updatedTenant, updatedAgent] = await prisma.$transaction([
    prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        planType: "FREE",
        status: "ACTIVE",
        organizationType: "BIREYSEL",
        name: soloFreeTenantDisplayName(agent),
        ownerAgentId: agent.id,
      },
    }),
    prisma.agent.update({
      where: { id: agent.id },
      data: {
        roleType: "DANISMAN",
        tenantMemberRole: "OWNER",
      },
    }),
  ]);

  return { agent: updatedAgent, tenant: updatedTenant, changed: true };
}

/** Allowlist e-postalar için PREMIUM + BROKERLIK ofis kurulumu. */
export async function ensureBrokerOfficeForAllowlistedAgent(
  agent: Agent,
  tenant: Tenant,
): Promise<{ agent: Agent; tenant: Tenant; changed: boolean }> {
  if (!isBrokerOwnerEmail(agent.email)) {
    return { agent, tenant, changed: false };
  }

  if (
    isBrokerOfficeTenant(tenant) &&
    agent.roleType === "BROKER" &&
    agent.tenantMemberRole === "OWNER" &&
    tenant.ownerAgentId === agent.id
  ) {
    return { agent, tenant, changed: false };
  }

  const [updatedTenant, updatedAgent] = await prisma.$transaction([
    prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        planType: "PREMIUM",
        status: "ACTIVE",
        organizationType: "BROKERLIK",
        name: brokerOfficeTenantDisplayName(agent),
        ownerAgentId: agent.id,
      },
    }),
    prisma.agent.update({
      where: { id: agent.id },
      data: {
        roleType: "BROKER",
        tenantMemberRole: "OWNER",
      },
    }),
  ]);

  return { agent: updatedAgent, tenant: updatedTenant, changed: true };
}

export async function ensureSoloFreeTenantIntegrity(
  agent: Agent,
  tenant: Tenant,
): Promise<{ agent: Agent; tenant: Tenant; changed: boolean }> {
  const teamSize = await prisma.agent.count({ where: { tenantId: tenant.id } });
  if (teamSize !== 1 || agent.tenantId !== tenant.id) {
    return { agent, tenant, changed: false };
  }

  let changed = false;
  let nextTenant = tenant;
  let nextAgent = agent;

  if (tenant.ownerAgentId !== agent.id) {
    nextTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { ownerAgentId: agent.id },
    });
    changed = true;
  }

  if (
    !isBrokerOfficeTenant(tenant) &&
    tenant.organizationType === "BIREYSEL" &&
    !tenant.name.includes("Bireysel")
  ) {
    nextTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { name: soloFreeTenantDisplayName(agent) },
    });
    changed = true;
  }

  if (
    !isBrokerOfficeTenant(tenant) &&
    agent.roleType !== "DANISMAN" &&
    !isBrokerOwnerEmail(agent.email)
  ) {
    nextAgent = await prisma.agent.update({
      where: { id: agent.id },
      data: { roleType: "DANISMAN" },
    });
    changed = true;
  }

  return { agent: nextAgent, tenant: nextTenant, changed };
}

export async function createDefaultFreeTenantForAgent(agent: Agent): Promise<{
  agent: Agent;
  tenant: Tenant;
}> {
  const tenant = await prisma.tenant.create({
    data: {
      name: soloFreeTenantDisplayName(agent),
      planType: "FREE",
      status: "ACTIVE",
      organizationType: "BIREYSEL",
      ownerAgentId: agent.id,
    },
  });

  const updatedAgent = await prisma.agent.update({
    where: { id: agent.id },
    data: {
      tenantId: tenant.id,
      roleType: "DANISMAN",
      tenantMemberRole: "OWNER",
    },
  });

  return { agent: updatedAgent, tenant };
}
