import { NextResponse } from "next/server";
import { z } from "zod";

import { createTenantInvite } from "@/lib/account/invite-codes";
import { canManageOfficeInvites } from "@/lib/account/permissions";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";
import { prisma } from "@/lib/prisma";

const createInviteSchema = z.object({
  maxUses: z.number().int().min(1).max(100).optional(),
  expiresInDays: z.number().int().min(1).max(90).optional(),
});

const inviteDeniedMessage =
  "Davet yönetimi yalnızca Broker Ofis paketindeki ofis sahibi veya yönetici tarafından kullanılabilir.";

export async function GET() {
  try {
    const agent = await requireCurrentAgent();
    const { tenant } = await getOrCreateTenantForAgent(agent.id);

    if (!canManageOfficeInvites(agent, tenant)) {
      return NextResponse.json({ error: inviteDeniedMessage }, { status: 403 });
    }

    const invites = await prisma.tenantInvite.findMany({
      where: { tenantId: tenant.id },
      orderBy: { olusturulmaTarihi: "desc" },
      take: 20,
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error("[GET /api/account/invites]", error);
    return NextResponse.json({ error: "Davetler alınamadı." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const agent = await requireCurrentAgent();
    const { tenant } = await getOrCreateTenantForAgent(agent.id);

    if (!canManageOfficeInvites(agent, tenant)) {
      return NextResponse.json({ error: inviteDeniedMessage }, { status: 403 });
    }

    const body = createInviteSchema.parse(await request.json());

    const invite = await createTenantInvite({
      tenantId: tenant.id,
      createdByAgentId: agent.id,
      inviteRoleType: "DANISMAN",
      tenantMemberRole: "MEMBER",
      maxUses: body.maxUses,
      expiresInDays: body.expiresInDays,
    });

    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz davet parametreleri." }, { status: 400 });
    }
    console.error("[POST /api/account/invites]", error);
    return NextResponse.json({ error: "Davet oluşturulamadı." }, { status: 500 });
  }
}
