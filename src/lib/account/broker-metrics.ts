import "server-only";

import type { DealStage } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const STAGE_LABELS: Record<DealStage, string> = {
  LEAD: "Aday",
  SHOWING: "Gösterim",
  OFFER: "Teklif",
  WON: "Kazanıldı",
  LOST: "Kaybedildi",
};

export async function getBrokerOfficeMetrics(tenantId: string) {
  const agents = await prisma.agent.findMany({
    where: { tenantId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      roleType: true,
      tenantMemberRole: true,
      licenseStatus: true,
      lastActiveAt: true,
      imageUrl: true,
      _count: {
        select: { deals: true, fsboLeads: true },
      },
    },
    orderBy: [{ tenantMemberRole: "asc" }, { lastActiveAt: "desc" }],
  });

  const agentIds = agents.map((a) => a.id);

  const [dealsByStage, totalClients, recentDeals] = await Promise.all([
    prisma.deal.groupBy({
      by: ["stage"],
      where: { agentId: { in: agentIds } },
      _count: { _all: true },
    }),
    prisma.client.count({
      where: {
        deals: { some: { agentId: { in: agentIds } } },
      },
    }),
    prisma.deal.findMany({
      where: { agentId: { in: agentIds } },
      take: 8,
      orderBy: { guncellenmeTarihi: "desc" },
      select: {
        id: true,
        stage: true,
        guncellenmeTarihi: true,
        client: { select: { adSoyad: true } },
        property: { select: { ilanBasligi: true } },
        agent: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  const pipeline = Object.entries(STAGE_LABELS).map(([stage, label]) => ({
    stage,
    label,
    count:
      dealsByStage.find((row) => row.stage === stage)?._count._all ?? 0,
  }));

  const totalDeals = pipeline.reduce((sum, row) => sum + row.count, 0);
  const wonDeals = pipeline.find((r) => r.stage === "WON")?.count ?? 0;
  const activeDeals =
    (pipeline.find((r) => r.stage === "LEAD")?.count ?? 0) +
    (pipeline.find((r) => r.stage === "SHOWING")?.count ?? 0) +
    (pipeline.find((r) => r.stage === "OFFER")?.count ?? 0);

  const memberStats = agents.map((agent) => ({
    id: agent.id,
    name:
      [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim() ||
      agent.email ||
      "Danışman",
    roleType: agent.roleType,
    tenantMemberRole: agent.tenantMemberRole,
    licenseStatus: agent.licenseStatus,
    imageUrl: agent.imageUrl,
    dealCount: agent._count.deals,
    fsboCount: agent._count.fsboLeads,
    lastActiveAt: agent.lastActiveAt.toISOString(),
  }));

  return {
    summary: {
      teamSize: agents.length,
      totalDeals,
      activeDeals,
      wonDeals,
      totalClients,
      conversionRate:
        totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0,
    },
    pipeline,
    memberStats,
    recentDeals: recentDeals.map((deal) => ({
      id: deal.id,
      stage: deal.stage,
      stageLabel: STAGE_LABELS[deal.stage],
      clientName: deal.client.adSoyad,
      propertyTitle: deal.property.ilanBasligi,
      agentName:
        [deal.agent?.firstName, deal.agent?.lastName].filter(Boolean).join(" ") ||
        "—",
      updatedAt: deal.guncellenmeTarihi.toISOString(),
    })),
  };
}
