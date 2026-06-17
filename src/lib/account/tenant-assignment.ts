import type { TenantMemberRole } from "@prisma/client";

/** agentId:null global orphan kayıtları — tenant havuzuna dahil edilmez */
export function isGlobalOrphanAgentId(agentId: string | null | undefined): boolean {
  return agentId == null;
}

export function isOfficeManagerRole(role: TenantMemberRole): boolean {
  return role === "OWNER" || role === "MANAGER";
}

export function filterTenantAgentIds(agentIds: string[]): string[] {
  return agentIds.filter((id) => id.trim().length > 0);
}

export function resolveManagerAgentIds(
  agents: Array<{ id: string; tenantMemberRole: TenantMemberRole }>,
): string[] {
  return agents.filter((agent) => isOfficeManagerRole(agent.tenantMemberRole)).map((a) => a.id);
}

/** Tenant içi atanabilir deal: yalnızca tenant danışmanına bağlı kayıtlar */
export function isTenantAssignableDeal(
  deal: { agentId: string | null },
  tenantAgentIds: string[],
): boolean {
  if (isGlobalOrphanAgentId(deal.agentId) || !deal.agentId) return false;
  return tenantAgentIds.includes(deal.agentId);
}

export function buildAssignmentNotificationDedupeKey(input: {
  resourceType: string;
  resourceId: string;
  assigneeAgentId: string;
  auditId: string;
}): string {
  return `assign:${input.resourceType}:${input.resourceId}:${input.assigneeAgentId}:${input.auditId}`;
}
