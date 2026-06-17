import { NextResponse } from "next/server";

import { requireCurrentAgent } from "@/lib/auth/agent";
import {
  dismissNotification,
  markNotificationRead,
} from "@/lib/notifications/queries";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const agent = await requireCurrentAgent();
    const { id } = await context.params;
    const body = (await request.json()) as { action?: string };

    if (body.action === "dismiss") {
      const ok = await dismissNotification(id, agent.id);
      if (!ok) {
        return NextResponse.json({ error: "Bildirim bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    }

    const ok = await markNotificationRead(id, agent.id);
    if (!ok) {
      return NextResponse.json({ error: "Bildirim bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "İşlem tamamlanamadı.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Oturum") ? 401 : 400 },
    );
  }
}
