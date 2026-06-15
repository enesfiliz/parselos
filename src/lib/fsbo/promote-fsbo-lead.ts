import "server-only";

import {
  agentOwnershipFilter,
  requireCurrentAgent,
} from "@/lib/auth/agent";
import { assertClientUsableForPromote } from "@/lib/clients/server-queries";
import { runBuyerMatchForDeal } from "@/lib/deals/deal-matching";
import { prisma } from "@/lib/prisma";
import { serializeFsboLead } from "@/lib/fsbo/serialize-lead";
import { serializeDeal } from "@/lib/fsbo/serialize-deal-bridge";
import type { FsboLeadData } from "@/lib/types/fsbo-lead";
import type { DealCardData } from "@/lib/types/deal";

export const FSBO_PHANTOM_CLIENT_PREFIX = "FSBO —";

async function serializeDealFromPrisma(dealId: string): Promise<DealCardData> {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { client: true, property: true },
  });

  if (!deal) {
    throw new Error("Oluşturulan fırsat bulunamadı.");
  }

  return serializeDeal(deal);
}

function fsboPlatformLabel(source: string) {
  return source.toLocaleLowerCase("tr-TR").includes("emlakjet")
    ? "Emlakjet"
    : "Sahibinden";
}

function buildListingIntel(
  lead: {
    price: number | null;
    title: string;
    source: string;
    location: string | null;
    region: string;
    metrekare: number | null;
    listedAt: Date | null;
  },
  budgetLabel: string | null,
) {
  return {
    fiyat: budgetLabel ?? "—",
    ilanTarihi: new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
    }).format(lead.listedAt ?? new Date()),
    metrekare: lead.metrekare ? `${lead.metrekare} m²` : "—",
    source: lead.source,
    title: lead.title,
    location: lead.location ?? lead.region,
  };
}

/**
 * FSBO ilanını mevcut bir müşteriye bağlayarak Potansiyel aşamasında fırsat açar.
 * İlan asla Client tablosuna kaydedilmez — yalnızca Property + Deal oluşturulur.
 */
export async function promoteFsboLeadToClient(
  leadId: string,
  clientId: string,
): Promise<{ lead: FsboLeadData; deal: DealCardData }> {
  const agent = await requireCurrentAgent();

  const lead = await prisma.fsboLead.findFirst({
    where: { id: leadId, ...agentOwnershipFilter(agent.id) },
  });

  if (!lead || lead.isDiscarded) {
    throw new Error("FSBO ilanı bulunamadı.");
  }

  const clientAccess = await assertClientUsableForPromote(clientId, agent.id);
  if (clientAccess === "not_found" || clientAccess === "forbidden") {
    throw new Error("Müşteri bulunamadı.");
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });

  if (!client) {
    throw new Error("Müşteri bulunamadı.");
  }

  if (client.adSoyad.startsWith(FSBO_PHANTOM_CLIENT_PREFIX)) {
    throw new Error(
      "Geçersiz müşteri kaydı. Lütfen gerçek bir müşteri seçin veya yeni müşteri oluşturun.",
    );
  }

  if (lead.promotedDealId) {
    const existingDeal = await serializeDealFromPrisma(lead.promotedDealId);
    return { lead: serializeFsboLead(lead), deal: existingDeal };
  }

  const price = lead.price ? Number(lead.price) : null;
  const budgetLabel =
    price && !Number.isNaN(price)
      ? new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: "TRY",
          maximumFractionDigits: 0,
        }).format(price)
      : null;

  const platform = fsboPlatformLabel(lead.source);
  const systemNote = `🤖 Sistem: ${platform}'deki "${lead.title}" ${client.adSoyad} müşterisiyle eşleştirildi ve Potansiyel aşamasına alındı.`;

  const property = await prisma.property.create({
    data: {
      ilanBasligi: lead.title,
      fiyat: price,
      il: lead.il ?? "Kocaeli",
      ilce: lead.ilce ?? lead.region,
      mahalle: lead.mahalle,
      metrekare: lead.metrekare,
      odaSayisi: lead.odaSayisi,
      durum: "SATILIK",
      tur: "FSBO",
    },
  });

  const deal = await prisma.deal.create({
    data: {
      stage: "LEAD",
      clientId: client.id,
      propertyId: property.id,
      agentId: agent.id,
      fsboLeadId: lead.id,
      notlar: `FSBO Radarı → ${client.adSoyad}\nKaynak: ${lead.source}\n${lead.url}`,
      etiket: "FSBO",
      budgetTL: price ? Math.round(price) : null,
      listingUrl: lead.url,
      listingIntel: buildListingIntel(lead, budgetLabel),
      dealNotes: {
        create: { content: systemNote },
      },
    },
    include: { client: true, property: true },
  });

  await prisma.fsboLead.update({
    where: { id: lead.id },
    data: {
      isRead: true,
      promotedDealId: deal.id,
      agentId: agent.id,
    },
  });

  await runBuyerMatchForDeal(deal.id);

  const [updatedLead, enrichedDeal] = await Promise.all([
    prisma.fsboLead.findUnique({ where: { id: lead.id } }),
    serializeDealFromPrisma(deal.id),
  ]);

  if (!updatedLead) {
    throw new Error("FSBO ilanı güncellenemedi.");
  }

  return {
    lead: serializeFsboLead(updatedLead),
    deal: enrichedDeal,
  };
}

/** @deprecated Her zaman `promoteFsboLeadToClient(leadId, clientId)` kullanın. */
export async function promoteFsboLeadToPipeline(
  leadId: string,
  clientId: string,
): Promise<{ lead: FsboLeadData; deal: DealCardData }> {
  return promoteFsboLeadToClient(leadId, clientId);
}
