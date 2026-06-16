import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import type { Agent, Tenant } from "@prisma/client";

import {
  AGENT_ROLE_LABELS,
  LICENSE_STATUS_LABELS,
  ORGANIZATION_TYPE_LABELS,
  PLAN_LABELS,
} from "@/lib/account/labels";
import { memberRoleLabel } from "@/lib/account/permissions";

export async function syncAgentProfileToClerk(
  clerkUserId: string,
  agent: Pick<
    Agent,
    | "roleType"
    | "tenantMemberRole"
    | "professionalTitle"
    | "phone"
    | "licenseNumber"
    | "licenseStatus"
    | "city"
    | "firstName"
    | "lastName"
  >,
  tenant: Pick<Tenant, "name" | "organizationType" | "planType" | "status"> | null,
) {
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        roleType: agent.roleType,
        roleLabel: AGENT_ROLE_LABELS[agent.roleType],
        professionalTitle: agent.professionalTitle ?? null,
        phone: agent.phone ?? null,
        licenseNumber: agent.licenseNumber ?? null,
        licenseStatus: agent.licenseStatus,
        licenseLabel: LICENSE_STATUS_LABELS[agent.licenseStatus],
        tenantMemberRole: agent.tenantMemberRole,
        tenantMemberLabel: memberRoleLabel(agent.tenantMemberRole, tenant),
        city: agent.city ?? null,
        organizationName: tenant?.name ?? null,
        organizationType: tenant?.organizationType ?? null,
        organizationLabel: tenant
          ? ORGANIZATION_TYPE_LABELS[tenant.organizationType]
          : null,
        planType: tenant?.planType ?? "FREE",
        planLabel: tenant ? PLAN_LABELS[tenant.planType] : PLAN_LABELS.FREE,
        tenantStatus: tenant?.status ?? "ACTIVE",
        profileSyncedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[syncAgentProfileToClerk]", clerkUserId, error);
  }
}
