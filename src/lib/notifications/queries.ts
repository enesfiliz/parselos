import "server-only";

import { requireCurrentAgent } from "@/lib/auth/agent";
import { prisma } from "@/lib/prisma";

import { formatNotificationTimeAgo, priorityToKind } from "./format";
import { syncNotificationsForCurrentAgent } from "./sync";
import type { AppNotification } from "./types";

function mapRow(row: {
  id: string;
  priority: string;
  title: string;
  message: string;
  href: string | null;
  read: boolean;
  dismissed: boolean;
  createdAt: Date;
}): AppNotification {
  return {
    id: row.id,
    kind: priorityToKind(row.priority),
    title: row.title,
    message: row.message,
    timeAgo: formatNotificationTimeAgo(row.createdAt.toISOString()),
    read: row.read,
    dismissed: row.dismissed,
    href: row.href,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listNotificationsForCurrentAgent(): Promise<AppNotification[]> {
  await syncNotificationsForCurrentAgent();
  const agent = await requireCurrentAgent();

  const rows = await prisma.agentNotification.findMany({
    where: { agentId: agent.id, dismissed: false },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return rows.map(mapRow);
}

export async function markAllNotificationsRead(agentId: string) {
  await prisma.agentNotification.updateMany({
    where: { agentId, dismissed: false, read: false },
    data: { read: true },
  });
}

export async function markNotificationRead(
  notificationId: string,
  agentId: string,
): Promise<boolean> {
  const result = await prisma.agentNotification.updateMany({
    where: { id: notificationId, agentId },
    data: { read: true },
  });
  return result.count > 0;
}

export async function dismissNotification(
  notificationId: string,
  agentId: string,
): Promise<boolean> {
  const result = await prisma.agentNotification.updateMany({
    where: { id: notificationId, agentId },
    data: { dismissed: true, read: true },
  });
  return result.count > 0;
}
