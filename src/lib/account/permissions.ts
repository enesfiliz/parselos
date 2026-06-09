import type {
  AgentPermissionSlice,
  TenantMemberRole,
  TenantPermissionSlice,
} from "@/lib/account/types";

export function isBrokerRole(roleType: AgentPermissionSlice["roleType"]) {
  return roleType === "BROKER";
}

/** Yönetim yetkisi yalnızca ofis hiyerarşisinden gelir — roleType tek başına yetki vermez */
export function isOfficeManager(agent: Pick<AgentPermissionSlice, "tenantMemberRole">) {
  return agent.tenantMemberRole === "OWNER" || agent.tenantMemberRole === "MANAGER";
}

export function canManageTeam(agent: Pick<AgentPermissionSlice, "tenantMemberRole">) {
  return isOfficeManager(agent);
}

export function canViewBrokerMetrics(
  agent: Pick<AgentPermissionSlice, "tenantMemberRole">,
  tenant: TenantPermissionSlice | null,
) {
  if (!tenant) return false;
  if (!isOfficeManager(agent)) return false;
  return (
    tenant.organizationType === "BROKERLIK" ||
    tenant.organizationType === "OFIS" ||
    tenant.organizationType === "KURULUS"
  );
}

export function canCreateInvites(agent: Pick<AgentPermissionSlice, "tenantMemberRole">) {
  return canManageTeam(agent);
}

export function canEditTenantProfile(agent: Pick<AgentPermissionSlice, "tenantMemberRole">) {
  return isOfficeManager(agent);
}

export function canRemoveTeamMember(
  actor: Pick<AgentPermissionSlice, "id" | "tenantMemberRole">,
  target: Pick<AgentPermissionSlice, "id" | "tenantMemberRole">,
) {
  if (actor.id === target.id) return false;
  if (target.tenantMemberRole === "OWNER") return false;
  if (actor.tenantMemberRole === "OWNER") return true;
  if (actor.tenantMemberRole === "MANAGER" && target.tenantMemberRole === "MEMBER") {
    return true;
  }
  return false;
}

export function memberRoleLabel(role: TenantMemberRole) {
  switch (role) {
    case "OWNER":
      return "Ofis Sahibi";
    case "MANAGER":
      return "Yönetici";
    case "MEMBER":
      return "Ekip Üyesi";
  }
}
