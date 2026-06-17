import "server-only";

import { requireCurrentAgent } from "@/lib/auth/agent";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";
import { isVoiceLogOwnedByAgent, VOICE_LOG_AGENT_ID_KEY } from "@/lib/voice-crm/agent-scope";
import { getVoiceCrmConfigStatus } from "@/lib/voice-crm/config";

import type { NotificationSeed } from "./types";

async function collectNotificationSeeds(
  agentId: string,
  tenantId: string | null,
  tenantMemberRole: string,
): Promise<NotificationSeed[]> {
  const seeds: NotificationSeed[] = [];
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const todayEvents = await prisma.event.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      deal: { agentId },
    },
    orderBy: { date: "asc" },
    take: 5,
    include: { deal: { include: { client: true } } },
  });

  for (const event of todayEvents) {
    const time = event.date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    seeds.push({
      type: "appointment_today",
      priority: "high",
      kind: "urgent",
      title: "Bugünkü randevu",
      message: `${time} — ${event.title}`,
      href: "/calendar",
      dedupeKey: `event:${event.id}:${event.date.toISOString().slice(0, 10)}`,
    });
  }

  if (
    tenantId &&
    (tenantMemberRole === "OWNER" || tenantMemberRole === "MANAGER")
  ) {
    const pendingInvites = await prisma.tenantInvite.count({
      where: { tenantId, isActive: true },
    });

    if (pendingInvites > 0) {
      seeds.push({
        type: "office_invite_pending",
        priority: "normal",
        kind: "opportunity",
        title: "Aktif ofis daveti",
        message: `${pendingInvites} davet kodu kullanıma açık.`,
        href: "/account?tab=ekip",
        dedupeKey: `invite:pending:${tenantId}`,
      });
    }
  }

  const config = getVoiceCrmConfigStatus();
  if (config.storageReady) {
    try {
      const supabase = createSupabaseAdmin();
      const { data } = await supabase
        .from("voice_crm_logs")
        .select("id, status, parsed_json_data")
        .eq("status", "pending")
        .contains("parsed_json_data", { [VOICE_LOG_AGENT_ID_KEY]: agentId })
        .limit(10);

      const pending = (data ?? []).filter((row) =>
        isVoiceLogOwnedByAgent(
          (row as { parsed_json_data?: unknown }).parsed_json_data,
          agentId,
        ),
      );

      for (const row of pending) {
        const id = String((row as { id?: string }).id ?? "");
        if (!id) continue;
        seeds.push({
          type: "voice_crm_pending",
          priority: "normal",
          kind: "opportunity",
          title: "Sesli CRM işlem bekliyor",
          message: "Sesli not müşteri kaydına işlenmeyi bekliyor.",
          href: "/sesli-crm",
          dedupeKey: `voice:pending:${id}`,
        });
      }
    } catch {
      // Voice log sync is best-effort.
    }
  }

  return seeds;
}

export async function syncNotificationsForCurrentAgent() {
  const agent = await requireCurrentAgent();
  const seeds = await collectNotificationSeeds(
    agent.id,
    agent.tenantId,
    agent.tenantMemberRole,
  );

  for (const seed of seeds) {
    await prisma.agentNotification.upsert({
      where: {
        agentId_dedupeKey: {
          agentId: agent.id,
          dedupeKey: seed.dedupeKey,
        },
      },
      create: {
        agentId: agent.id,
        tenantId: agent.tenantId,
        type: seed.type,
        priority: seed.priority ?? "normal",
        title: seed.title,
        message: seed.message,
        href: seed.href ?? null,
        dedupeKey: seed.dedupeKey,
      },
      update: {
        title: seed.title,
        message: seed.message,
        href: seed.href ?? null,
        priority: seed.priority ?? "normal",
      },
    });
  }

  return agent.id;
}
