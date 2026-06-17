import { NextResponse } from "next/server";
import { z } from "zod";

import {
  assignClientToAgent,
  assignDealToAgent,
  listAssignmentHistoryForTenant,
  listUnassignedForTenant,
} from "@/lib/account/assignment-service";
import { requireCurrentAgent } from "@/lib/auth/agent";

export const runtime = "nodejs";

const assignSchema = z.object({
  resourceType: z.enum(["deal", "client"]),
  resourceId: z.string().uuid(),
  assigneeAgentId: z.string().uuid(),
});

export async function GET() {
  try {
    await requireCurrentAgent();
    const [pool, history] = await Promise.all([
      listUnassignedForTenant(),
      listAssignmentHistoryForTenant(),
    ]);
    return NextResponse.json({
      data: {
        ...pool,
        history,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Atama listesi yüklenemedi.";
    const status = message.includes("yetkisi") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireCurrentAgent();
    const body = assignSchema.parse(await request.json());

    if (body.resourceType === "deal") {
      const result = await assignDealToAgent({
        dealId: body.resourceId,
        assigneeAgentId: body.assigneeAgentId,
      });
      return NextResponse.json(result);
    }

    const result = await assignClientToAgent({
      clientId: body.resourceId,
      assigneeAgentId: body.assigneeAgentId,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Atama yapılamadı.";
    const status = message.includes("yetkisi") ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
