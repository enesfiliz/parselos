import { NextResponse } from "next/server";

import { agentOwnershipFilter, requireCurrentAgent } from "@/lib/auth/agent";
import { serializeFsboLead } from "@/lib/fsbo/serialize-lead";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const agent = await requireCurrentAgent();
    const { id } = await context.params;

    const existing = await prisma.fsboLead.findFirst({
      where: { id, ...agentOwnershipFilter(agent.id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
    }

    const lead = await prisma.fsboLead.update({
      where: { id },
      data: { isDiscarded: true, isRead: true, agentId: agent.id },
    });

    return NextResponse.json({
      success: true,
      data: serializeFsboLead(lead),
    });
  } catch (error) {
    console.error("[POST /api/fsbo-leads/discard]", error);

    if (error instanceof Error && error.message.includes("Oturum")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "İlan çöpe atılamadı." },
      { status: 500 },
    );
  }
}
