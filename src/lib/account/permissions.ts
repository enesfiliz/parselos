import type {
  AgentPermissionSlice,
  TenantMemberRole,
  TenantPermissionSlice,
  TenantPlanType,
} from "@/lib/account/types";

/** Broker Ofis paketi: PREMIUM plan + BROKERLIK organizasyonu */
export function isBrokerOfficeTenant(
  tenant: Pick<TenantPermissionSlice, "planType" | "organizationType"> | null,
): boolean {
  if (!tenant?.planType) return false;
  return tenant.planType === "PREMIUM" && tenant.organizationType === "BROKERLIK";
}

/** Ofis yönetim hiyerarşisi — schema'da ADMIN yok; MANAGER = yönetici */
export function isOfficeInviteAdmin(
  agent: Pick<AgentPermissionSlice, "tenantMemberRole">,
) {
  return agent.tenantMemberRole === "OWNER" || agent.tenantMemberRole === "MANAGER";
}

/** @deprecated roleType tek başına yetki vermez — isOfficeInviteAdmin kullanın */
export function isBrokerRole(roleType: NonNullable<AgentPermissionSlice["roleType"]>) {
  return roleType === "BROKER";
}

/** Genel ekip yönetimi (profil vb.) — paket kontrolü içermez */
export function isOfficeManager(agent: Pick<AgentPermissionSlice, "tenantMemberRole">) {
  return isOfficeInviteAdmin(agent);
}

export function canManageTeam(
  agent: Pick<AgentPermissionSlice, "tenantMemberRole">,
  tenant: TenantPermissionSlice | null,
) {
  if (!isBrokerOfficeTenant(tenant)) return false;
  return isOfficeInviteAdmin(agent);
}

/**
 * Broker Ofis davet/çıkarma/rol yönetimi.
 * Sadece PREMIUM + BROKERLIK tenant'ta OWNER veya MANAGER.
 */
export function canManageOfficeInvites(
  agent: Pick<AgentPermissionSlice, "tenantId" | "tenantMemberRole">,
  tenant: TenantPermissionSlice | null,
): boolean {
  if (!tenant?.id || !tenant.status || !tenant.planType) return false;
  if (tenant.status !== "ACTIVE") return false;
  if (!isBrokerOfficeTenant(tenant)) return false;
  if (agent.tenantId !== tenant.id) return false;
  return isOfficeInviteAdmin(agent);
}

export function canCreateInvites(
  agent: Pick<AgentPermissionSlice, "tenantId" | "tenantMemberRole">,
  tenant: TenantPermissionSlice | null,
) {
  return canManageOfficeInvites(agent, tenant);
}

export function canViewBrokerMetrics(
  agent: Pick<AgentPermissionSlice, "tenantMemberRole">,
  tenant: TenantPermissionSlice | null,
) {
  if (!tenant || !isBrokerOfficeTenant(tenant)) return false;
  return isOfficeInviteAdmin(agent);
}

export function canEditTenantProfile(
  agent: Pick<AgentPermissionSlice, "tenantMemberRole">,
  tenant: TenantPermissionSlice | null,
) {
  return canManageTeam(agent, tenant);
}

export function canSelectAgentRoleType(
  agent: Pick<AgentPermissionSlice, "tenantMemberRole">,
  tenant: TenantPermissionSlice | null,
) {
  return canManageTeam(agent, tenant);
}

export function canRemoveTeamMember(
  actor: Pick<AgentPermissionSlice, "id" | "tenantId" | "tenantMemberRole">,
  target: Pick<AgentPermissionSlice, "id" | "tenantMemberRole">,
  tenant: TenantPermissionSlice | null,
) {
  if (!canManageOfficeInvites(actor, tenant)) return false;
  if (actor.id === target.id) return false;
  if (target.tenantMemberRole === "OWNER") return false;
  if (actor.tenantMemberRole === "OWNER") return true;
  if (actor.tenantMemberRole === "MANAGER" && target.tenantMemberRole === "MEMBER") {
    return true;
  }
  return false;
}

export function canChangeTeamMemberRole(
  actor: Pick<AgentPermissionSlice, "tenantId" | "tenantMemberRole">,
  tenant: TenantPermissionSlice | null,
) {
  return canManageOfficeInvites(actor, tenant) && actor.tenantMemberRole === "OWNER";
}

/** Davet kodu girme alanı — broker ofis adminleri hariç, zaten bağlı üyeler hariç */
export function canShowOfficeJoinForm(
  agent: Pick<AgentPermissionSlice, "tenantId" | "tenantMemberRole">,
  tenant: TenantPermissionSlice | null,
  memberCount: number,
): boolean {
  if (canManageOfficeInvites(agent, tenant)) return false;

  if (
    tenant &&
    isBrokerOfficeTenant(tenant) &&
    agent.tenantId === tenant.id &&
    memberCount > 1
  ) {
    return false;
  }

  if (
    tenant &&
    isBrokerOfficeTenant(tenant) &&
    agent.tenantId === tenant.id &&
    agent.tenantMemberRole !== "OWNER"
  ) {
    return false;
  }

  return true;
}

export function brokerOfficeUpgradeMessage(planType: TenantPlanType | undefined) {
  if (planType === "PREMIUM") {
    return "Ekip davetleri yalnızca Broker Ofis (BROKERLIK) kurulumunda kullanılabilir.";
  }
  return "Ekip davetleri Broker Ofis paketinde kullanılabilir.";
}

export function memberRoleLabel(
  role: TenantMemberRole,
  tenant?: Pick<TenantPermissionSlice, "planType" | "organizationType"> | null,
) {
  if (
    role === "OWNER" &&
    tenant &&
    !isBrokerOfficeTenant(tenant) &&
    tenant.organizationType === "BIREYSEL"
  ) {
    return "Bireysel Hesap";
  }

  switch (role) {
    case "OWNER":
      return "Ofis Sahibi";
    case "MANAGER":
      return "Yönetici";
    case "MEMBER":
      return "Ekip Üyesi";
  }
}
