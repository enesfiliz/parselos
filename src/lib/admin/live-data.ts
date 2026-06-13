import type { TenantPlanType, TenantStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type LiveAdminSubscriber = {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Pro" | "Premium";
  status: "active" | "suspended" | "blocked" | "inactive";
  aiTokensUsed: number;
  dealCount: number;
  lastLoginLabel: string;
  tenantName: string | null;
  city: string | null;
  memberCount: number;
};

export type LiveAdminMetrics = {
  totalAgents: number;
  activeAgents7d: number;
  totalTenants: number;
  paidTenants: number;
  totalDeals: number;
  totalProperties: number;
  fsboLeads: number;
};

function mapPlan(planType: TenantPlanType | null | undefined): LiveAdminSubscriber["plan"] {
  switch (planType) {
    case "PRO":
      return "Pro";
    case "PREMIUM":
      return "Premium";
    default:
      return "Free";
  }
}

function mapStatus(status: TenantStatus | null | undefined): LiveAdminSubscriber["status"] {
  switch (status) {
    case "ACTIVE":
    case "TRIAL":
      return "active";
    case "PAST_DUE":
      return "suspended";
    case "CANCELLED":
      return "blocked";
    default:
      return "inactive";
  }
}

function formatRelative(date: Date | null | undefined) {
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  return date.toLocaleDateString("tr-TR");
}

function displayName(
  firstName: string | null,
  lastName: string | null,
  email: string | null,
) {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (email) return email.split("@")[0] ?? email;
  return "Danışman";
}

export async function fetchLiveAdminSubscribers(): Promise<LiveAdminSubscriber[]> {
  const [agents, tenantMemberCounts] = await Promise.all([
    prisma.agent.findMany({
      include: {
        tenant: true,
        _count: { select: { deals: true } },
      },
      orderBy: { lastActiveAt: "desc" },
      take: 300,
    }),
    prisma.agent.groupBy({
      by: ["tenantId"],
      where: { tenantId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const memberCountByTenant = new Map(
    tenantMemberCounts
      .filter((row) => row.tenantId)
      .map((row) => [row.tenantId as string, row._count._all]),
  );

  return agents.map((agent) => ({
    id: agent.id,
    name: displayName(agent.firstName, agent.lastName, agent.email),
    email: agent.email ?? "—",
    plan: mapPlan(agent.tenant?.planType),
    status: mapStatus(agent.tenant?.status),
    aiTokensUsed: 0,
    dealCount: agent._count.deals,
    lastLoginLabel: formatRelative(agent.lastActiveAt),
    tenantName: agent.tenant?.name ?? null,
    city: agent.city ?? agent.tenant?.city ?? null,
    memberCount: agent.tenantId
      ? (memberCountByTenant.get(agent.tenantId) ?? 1)
      : 0,
  }));
}

export async function fetchLiveAdminMetrics(): Promise<LiveAdminMetrics> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalAgents,
    activeAgents7d,
    totalTenants,
    paidTenants,
    totalDeals,
    totalProperties,
    fsboLeads,
  ] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.count({ where: { lastActiveAt: { gte: sevenDaysAgo } } }),
    prisma.tenant.count(),
    prisma.tenant.count({
      where: { planType: { in: ["PRO", "PREMIUM"] }, status: { not: "CANCELLED" } },
    }),
    prisma.deal.count(),
    prisma.property.count(),
    prisma.fsboLead.count(),
  ]);

  return {
    totalAgents,
    activeAgents7d,
    totalTenants,
    paidTenants,
    totalDeals,
    totalProperties,
    fsboLeads,
  };
}

export type LiveAdminRecentAgent = {
  id: string;
  name: string;
  email: string;
  plan: LiveAdminSubscriber["plan"];
  event: "Kayıt" | "Giriş" | "Yükseltme";
  whenLabel: string;
};

export async function fetchLiveRecentAgents(limit = 8): Promise<LiveAdminRecentAgent[]> {
  const agents = await prisma.agent.findMany({
    include: { tenant: true },
    orderBy: { olusturulmaTarihi: "desc" },
    take: limit,
  });

  return agents.map((agent) => {
    const createdRecently =
      Date.now() - agent.olusturulmaTarihi.getTime() < 48 * 60 * 60 * 1000;
    const isPaid =
      agent.tenant?.planType === "PRO" || agent.tenant?.planType === "PREMIUM";

    return {
      id: agent.id,
      name: displayName(agent.firstName, agent.lastName, agent.email),
      email: agent.email ?? "—",
      plan: mapPlan(agent.tenant?.planType),
      event: createdRecently ? "Kayıt" : isPaid ? "Yükseltme" : "Giriş",
      whenLabel: formatRelative(agent.olusturulmaTarihi),
    };
  });
}
