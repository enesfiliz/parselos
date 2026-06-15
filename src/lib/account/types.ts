/** Prisma şemasıyla senkron — IDE/client tarafında @prisma/client üretimi gecikse bile tip güvenliği */
export const AGENT_ROLE_TYPES = ["DANISMAN", "KURULUS", "BROKER"] as const;
export type AgentRoleType = (typeof AGENT_ROLE_TYPES)[number];

export const TENANT_MEMBER_ROLES = ["OWNER", "MANAGER", "MEMBER"] as const;
export type TenantMemberRole = (typeof TENANT_MEMBER_ROLES)[number];

export const TENANT_ORG_TYPES = ["BIREYSEL", "OFIS", "KURULUS", "BROKERLIK"] as const;
export type TenantOrganizationType = (typeof TENANT_ORG_TYPES)[number];

export const LICENSE_STATUSES = ["NONE", "PENDING", "VERIFIED", "REJECTED"] as const;
export type LicenseVerificationStatus = (typeof LICENSE_STATUSES)[number];

export const TENANT_PLAN_TYPES = ["FREE", "PRO", "PREMIUM"] as const;
export type TenantPlanType = (typeof TENANT_PLAN_TYPES)[number];

export const TENANT_STATUSES = [
  "ACTIVE",
  "PENDING",
  "PAST_DUE",
  "CANCELLED",
  "TRIAL",
] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

export type AgentPermissionSlice = {
  id: string;
  tenantId?: string | null;
  tenantMemberRole: TenantMemberRole;
  roleType?: AgentRoleType;
};

export type TenantPermissionSlice = {
  id?: string;
  planType?: TenantPlanType;
  status?: TenantStatus;
  organizationType: TenantOrganizationType;
};
