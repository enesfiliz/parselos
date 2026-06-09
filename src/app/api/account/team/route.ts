import { NextResponse } from "next/server";

import { canManageTeam } from "@/lib/account/permissions";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const agent = await requireCurrentAgent();
    const { tenant } = await getOrCreateTenantForAgent(agent.id);

    const members = await prisma.agent.findMany({
      where: { tenantId: tenant.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        imageUrl: true,
        roleType: true,
        tenantMemberRole: true,
        licenseStatus: true,
        licenseNumber: true,
        phone: true,
        city: true,
        professionalTitle: true,
        lastActiveAt: true,
        _count: { select: { deals: true, fsboLeads: true } },
      },
      orderBy: [{ tenantMemberRole: "asc" }, { firstName: "asc" }],
    });

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        organizationType: tenant.organizationType,
      },
      members,
      canManage: canManageTeam(agent),
    });
  } catch (error) {
    console.error("[GET /api/account/team]", error);
    return NextResponse.json({ error: "Ekip listesi alınamadı." }, { status: 500 });
  }
}
