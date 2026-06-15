import { NextResponse } from "next/server";
import { z } from "zod";

import {
  canChangeTeamMemberRole,
  canManageOfficeInvites,
  canRemoveTeamMember,
} from "@/lib/account/permissions";
import {
  removeAgentFromTenant,
  updateTeamMemberRole,
} from "@/lib/account/team-service";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  tenantMemberRole: z.enum(["MANAGER", "MEMBER"]).optional(),
  action: z.enum(["remove"]).optional(),
});

type RouteContext = { params: Promise<{ agentId: string }> };

const teamDeniedMessage =
  "Ekip yönetimi yalnızca Broker Ofis paketindeki ofis sahibi veya yönetici tarafından kullanılabilir.";

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { agentId } = await context.params;
    const actor = await requireCurrentAgent();
    const { tenant } = await getOrCreateTenantForAgent(actor.id);

    if (!canManageOfficeInvites(actor, tenant)) {
      return NextResponse.json({ error: teamDeniedMessage }, { status: 403 });
    }

    const body = patchSchema.parse(await request.json());
    const target = await prisma.agent.findFirst({
      where: { id: agentId, tenantId: tenant.id },
    });

    if (!target) {
      return NextResponse.json({ error: "Üye bulunamadı." }, { status: 404 });
    }

    if (body.action === "remove") {
      if (!canRemoveTeamMember(actor, target, tenant)) {
        return NextResponse.json({ error: "Bu üyeyi kaldıramazsınız." }, { status: 403 });
      }
      await removeAgentFromTenant(actor.id, agentId, tenant.id);
      return NextResponse.json({ success: true });
    }

    if (body.tenantMemberRole) {
      if (!canChangeTeamMemberRole(actor, tenant)) {
        return NextResponse.json({ error: "Rol değiştirme yetkisi yok." }, { status: 403 });
      }
      const updated = await updateTeamMemberRole(
        tenant.id,
        agentId,
        body.tenantMemberRole,
      );
      return NextResponse.json({ agent: updated });
    }

    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
    }
    console.error("[PATCH /api/account/team/[agentId]]", error);
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}
