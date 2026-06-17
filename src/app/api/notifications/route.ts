import { NextResponse } from "next/server";

import { requireCurrentAgent } from "@/lib/auth/agent";
import {
  listNotificationsForCurrentAgent,
  markAllNotificationsRead,
} from "@/lib/notifications/queries";

export const runtime = "nodejs";

export async function GET() {
  try {
    const notifications = await listNotificationsForCurrentAgent();
    const unreadCount = notifications.filter((item) => !item.read).length;
    return NextResponse.json({ data: notifications, unreadCount });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bildirimler yüklenemedi.";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Oturum") ? 401 : 500 },
    );
  }
}

export async function PATCH() {
  try {
    const agent = await requireCurrentAgent();
    await markAllNotificationsRead(agent.id);
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
