import { NextResponse } from "next/server";

import { assertClientLinkableByAgent } from "@/lib/clients/server-queries";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { listVoiceLogsForClient } from "@/lib/voice-crm/voice-log-store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const agent = await requireCurrentAgent();
    const { id } = await context.params;

    const linkable = await assertClientLinkableByAgent(id, agent.id);
    if (linkable === "not_found") {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }
    if (linkable === "forbidden") {
      return NextResponse.json({ error: "Bu müşteri kaydına erişim yok." }, { status: 403 });
    }

    const logs = await listVoiceLogsForClient(agent.id, id);
    return NextResponse.json({ data: logs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kayıtlar yüklenemedi.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Oturum") ? 401 : 400 },
    );
  }
}
