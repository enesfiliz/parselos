"use server";

import { revalidatePath } from "next/cache";

import {
  agentOwnershipFilter,
  requireCurrentAgent,
} from "@/lib/auth/agent";
import { promoteFsboLeadToClient } from "@/lib/fsbo/promote-fsbo-lead";
import { serializeFsboLead } from "@/lib/fsbo/serialize-lead";
import { prisma } from "@/lib/prisma";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const FSBO_PHANTOM_CLIENT_PREFIX = "FSBO —";

export type FsboPromoteClientOption = {
  id: string;
  adSoyad: string;
  telefon: string | null;
  butce: string | null;
  mulkTipi: string | null;
};

export async function promoteFsboLeadAction(
  leadId: string,
  clientId: string,
): Promise<
  ActionResult<{
    leadId: string;
    dealId: string;
    clientName: string;
  }>
> {
  return promoteFsboLeadToClientAction(leadId, clientId);
}

export async function listClientsForFsboPromoteAction(): Promise<
  ActionResult<FsboPromoteClientOption[]>
> {
  try {
    await requireCurrentAgent();

    const clients = await prisma.client.findMany({
      where: {
        NOT: {
          adSoyad: { startsWith: FSBO_PHANTOM_CLIENT_PREFIX },
        },
      },
      orderBy: { adSoyad: "asc" },
      select: {
        id: true,
        adSoyad: true,
        telefon: true,
        butce: true,
        mulkTipi: true,
      },
    });

    return { success: true, data: clients };
  } catch (error) {
    console.error("[listClientsForFsboPromoteAction]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Müşteriler listelenemedi.",
    };
  }
}

export async function createClientForFsboPromoteAction(input: {
  adSoyad: string;
  telefon?: string;
}): Promise<ActionResult<FsboPromoteClientOption>> {
  try {
    await requireCurrentAgent();

    const adSoyad = input.adSoyad.trim();
    if (adSoyad.length < 2) {
      return { success: false, error: "Müşteri adı en az 2 karakter olmalıdır." };
    }

    if (adSoyad.startsWith(FSBO_PHANTOM_CLIENT_PREFIX)) {
      return {
        success: false,
        error: "İlan başlığı müşteri adı olarak kullanılamaz.",
      };
    }

    const client = await prisma.client.create({
      data: {
        adSoyad,
        telefon: input.telefon?.trim() || null,
        kaynak: "FSBO Radarı",
      },
      select: {
        id: true,
        adSoyad: true,
        telefon: true,
        butce: true,
        mulkTipi: true,
      },
    });

    revalidatePath("/customers");

    return { success: true, data: client };
  } catch (error) {
    console.error("[createClientForFsboPromoteAction]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Müşteri oluşturulamadı.",
    };
  }
}

export async function promoteFsboLeadToClientAction(
  leadId: string,
  clientId: string,
): Promise<
  ActionResult<{
    leadId: string;
    dealId: string;
    clientName: string;
  }>
> {
  try {
    if (!leadId.trim() || !clientId.trim()) {
      return { success: false, error: "İlan ve müşteri seçimi zorunludur." };
    }

    const result = await promoteFsboLeadToClient(leadId.trim(), clientId.trim());

    revalidatePath("/fsbo-radar");
    revalidatePath("/deals");
    revalidatePath("/customers");

    return {
      success: true,
      data: {
        leadId: result.lead.id,
        dealId: result.deal.id,
        clientName: result.deal.client.adSoyad,
      },
    };
  } catch (error) {
    console.error("[promoteFsboLeadToClientAction]", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "İlan müşteriye atanamadı.",
    };
  }
}

export async function discardFsboLeadAction(
  leadId: string,
): Promise<ActionResult<{ leadId: string }>> {
  try {
    const agent = await requireCurrentAgent();

    const existing = await prisma.fsboLead.findFirst({
      where: { id: leadId, ...agentOwnershipFilter(agent.id) },
    });

    if (!existing) {
      return { success: false, error: "İlan bulunamadı." };
    }

    const lead = await prisma.fsboLead.update({
      where: { id: leadId },
      data: { isDiscarded: true, agentId: agent.id },
    });

    revalidatePath("/fsbo-radar");

    return {
      success: true,
      data: { leadId: serializeFsboLead(lead).id },
    };
  } catch (error) {
    console.error("[discardFsboLeadAction]", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "İlan çöpe atılamadı.",
    };
  }
}
