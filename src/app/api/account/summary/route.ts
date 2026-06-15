import { NextResponse } from "next/server";

import {
  canManageOfficeInvites,
  canManageTeam,
  canViewBrokerMetrics,
} from "@/lib/account/permissions";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const agent = await requireCurrentAgent();
    const { tenant } = await getOrCreateTenantForAgent(agent.id);

    const teamCount = await prisma.agent.count({ where: { tenantId: tenant.id } });
    const activeInvites = await prisma.tenantInvite.count({
      where: { tenantId: tenant.id, isActive: true },
    });

    let dealCount = 0;
    if (canViewBrokerMetrics(agent, tenant)) {
      const agentIds = (
        await prisma.agent.findMany({
          where: { tenantId: tenant.id },
          select: { id: true },
        })
      ).map((a) => a.id);
      dealCount = await prisma.deal.count({
        where: { agentId: { in: agentIds } },
      });
    } else {
      dealCount = await prisma.deal.count({ where: { agentId: agent.id } });
    }

    return NextResponse.json({
      agent: {
        id: agent.id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        imageUrl: agent.imageUrl,
        roleType: agent.roleType,
        tenantMemberRole: agent.tenantMemberRole,
        licenseStatus: agent.licenseStatus,
        licenseNumber: agent.licenseNumber,
        professionalTitle: agent.professionalTitle,
        city: agent.city,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        planType: tenant.planType,
        status: tenant.status,
        organizationType: tenant.organizationType,
      },
      capabilities: {
        canManageTeam: canManageTeam(agent),
        canManageOfficeInvites: canManageOfficeInvites(agent, tenant),
        canViewBrokerMetrics: canViewBrokerMetrics(agent, tenant),
      },
      stats: {
        teamCount,
        activeInvites,
        dealCount,
      },
    });
  } catch (error) {
    console.error("[GET /api/account/summary]", error);
    return NextResponse.json({ error: "Özet alınamadı." }, { status: 500 });
  }
}
