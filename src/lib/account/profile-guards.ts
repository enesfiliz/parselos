import "server-only";

import type { AgentRoleType, TenantOrganizationType } from "@prisma/client";

import { isBrokerOwnerEmail } from "@/lib/account/broker-owner";
import { isBrokerOfficeTenant } from "@/lib/account/permissions";
import type { TenantPermissionSlice } from "@/lib/account/types";

export class ProfileUpgradeBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProfileUpgradeBlockedError";
  }
}

const ELEVATED_ORG_TYPES = new Set<TenantOrganizationType>([
  "OFIS",
  "KURULUS",
  "BROKERLIK",
]);

const ELEVATED_ROLE_TYPES = new Set<AgentRoleType>(["BROKER", "KURULUS"]);

export function assertAllowedRoleTypeChange(
  email: string | null | undefined,
  tenant: TenantPermissionSlice | null,
  nextRoleType: AgentRoleType | undefined,
  currentRoleType: AgentRoleType,
) {
  if (!nextRoleType || nextRoleType === currentRoleType) return;
  if (isBrokerOwnerEmail(email)) return;
  if (isBrokerOfficeTenant(tenant)) return;

  if (ELEVATED_ROLE_TYPES.has(nextRoleType)) {
    throw new ProfileUpgradeBlockedError(
      "Broker veya kuruluş rolü yalnızca Broker Ofis aboneliği ile kullanılabilir.",
    );
  }
}

export function assertAllowedOrganizationTypeChange(
  email: string | null | undefined,
  tenant: TenantPermissionSlice | null,
  nextOrganizationType: TenantOrganizationType | undefined,
  currentOrganizationType: TenantOrganizationType,
) {
  if (!nextOrganizationType || nextOrganizationType === currentOrganizationType) {
    return;
  }
  if (isBrokerOwnerEmail(email)) return;
  if (isBrokerOfficeTenant(tenant)) return;

  if (ELEVATED_ORG_TYPES.has(nextOrganizationType)) {
    throw new ProfileUpgradeBlockedError(
      "Ofis veya brokerlık yapısı yalnızca Broker Ofis aboneliği ile seçilebilir.",
    );
  }
}
