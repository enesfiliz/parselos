import { NextResponse } from "next/server";

import { canCreateInvites } from "@/lib/account/permissions";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const agent = await requireCurrentAgent();
    const { tenant } = await getOrCreateTenantForAgent(agent.id);

    if (!canCreateInvites(agent)) {
      return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
    }

    const invite = await prisma.tenantInvite.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!invite) {
      return NextResponse.json({ error: "Davet bulunamadı." }, { status: 404 });
    }

    await prisma.tenantInvite.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/account/invites/[id]]", error);
    return NextResponse.json({ error: "Davet iptal edilemedi." }, { status: 500 });
  }
}
