"use server";

import { revalidatePath } from "next/cache";

import {
  agentOwnershipFilter,
  requireCurrentAgent,
} from "@/lib/auth/agent";
import { assertClientLinkableByAgent } from "@/lib/clients/server-queries";
import { findOrCreateClient } from "@/lib/deals/find-or-create-client";
import { resolvePropertyAgentAccess } from "@/lib/properties/ownership";
import {
  fsboPlatformDisplayName,
  matchFsboLeadsForDeal,
  type FsboDealMatch,
} from "@/lib/deals/match-fsbo";
import { serializeFsboLead } from "@/lib/fsbo/serialize-lead";
import { serializeDeal as serializeDealBridge } from "@/lib/fsbo/serialize-deal-bridge";
import { prisma } from "@/lib/prisma";
import type {
  BuyerMatch,
  DealCardData,
  DealNoteData,
  DealTask,
  ListingIntel,
} from "@/lib/types/deal";
import { DEFAULT_DEAL_TASKS } from "@/lib/types/deal";
import {
  DealStage,
  PropertyListingStatus,
  PropertyOwnershipType,
  type Prisma,
} from "@prisma/client";

const DEALS_PATH = "/deals";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseDealTasks(value: Prisma.JsonValue | null): DealTask[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const tasks = value
    .map((item) => {
      if (!isRecord(item)) return null;
      const id = item.id;
      const label = item.label;
      const completed = item.completed;
      if (
        typeof id !== "string" ||
        typeof label !== "string" ||
        typeof completed !== "boolean"
      ) {
        return null;
      }
      return { id, label, completed };
    })
    .filter((task): task is DealTask => task !== null);

  return tasks.length > 0 ? tasks : undefined;
}

function parseBuyerMatch(
  value: Prisma.JsonValue | null,
): BuyerMatch | null | undefined {
  if (!isRecord(value)) return value === null ? null : undefined;

  const clientId = value.clientId;
  const adSoyad = value.adSoyad;
  const score = value.score;
  const reasons = value.reasons;
  const matchedAt = value.matchedAt;

  if (
    typeof clientId !== "string" ||
    typeof adSoyad !== "string" ||
    typeof score !== "number" ||
    !Array.isArray(reasons) ||
    typeof matchedAt !== "string"
  ) {
    return undefined;
  }

  return {
    clientId,
    adSoyad,
    telefon: typeof value.telefon === "string" ? value.telefon : null,
    score,
    reasons: reasons.filter((r): r is string => typeof r === "string"),
    matchedAt,
  };
}

function parseListingIntel(
  value: Prisma.JsonValue | null,
): ListingIntel | null | undefined {
  if (!isRecord(value)) return value === null ? null : undefined;

  const fiyat = value.fiyat;
  const ilanTarihi = value.ilanTarihi;
  const metrekare = value.metrekare;

  if (
    typeof fiyat !== "string" ||
    typeof ilanTarihi !== "string" ||
    typeof metrekare !== "string"
  ) {
    return undefined;
  }

  return {
    fiyat,
    ilanTarihi,
    metrekare,
    source: typeof value.source === "string" ? value.source : undefined,
    title: typeof value.title === "string" ? value.title : undefined,
    location: typeof value.location === "string" ? value.location : undefined,
  };
}

function serializeDeal(
  deal: Prisma.DealGetPayload<{
    include: { client: true; property: true };
  }>,
): DealCardData {
  return {
    id: deal.id,
    stage: deal.stage,
    notlar: deal.notlar,
    etiket: deal.etiket,
    sonIletisim: deal.sonIletisim,
    budgetTL: deal.budgetTL,
    tasks: parseDealTasks(deal.tasks),
    listingUrl: deal.listingUrl,
    listingIntel: parseListingIntel(deal.listingIntel),
    buyerMatch: parseBuyerMatch(deal.buyerMatch),
    olusturulmaTarihi: deal.olusturulmaTarihi.toISOString(),
    guncellenmeTarihi: deal.guncellenmeTarihi.toISOString(),
    client: {
      id: deal.client.id,
      adSoyad: deal.client.adSoyad,
      telefon: deal.client.telefon,
      email: deal.client.email,
      kaynak: deal.client.kaynak,
      butce: deal.client.butce,
      mulkTipi: deal.client.mulkTipi,
    },
    property: {
      id: deal.property.id,
      ilanBasligi: deal.property.ilanBasligi,
      fiyat: deal.property.fiyat?.toString() ?? null,
      il: deal.property.il,
      ilce: deal.property.ilce,
      mahalle: deal.property.mahalle,
      ada: deal.property.ada,
      parsel: deal.property.parsel,
      durum: deal.property.durum,
      tur: deal.property.tur,
      odaSayisi: deal.property.odaSayisi,
      metrekare: deal.property.metrekare,
    },
  };
}

function isDealStage(value: string): value is DealStage {
  return (
    value === "LEAD" ||
    value === "SHOWING" ||
    value === "OFFER" ||
    value === "WON" ||
    value === "LOST"
  );
}

export async function getDeals(): Promise<ActionResult<DealCardData[]>> {
  try {
    const agent = await requireCurrentAgent();

    const deals = await prisma.deal.findMany({
      where: agentOwnershipFilter(agent.id),
      include: { client: true, property: true },
      orderBy: { guncellenmeTarihi: "desc" },
    });

    return { success: true, data: deals.map(serializeDeal) };
  } catch (error) {
    console.error("[getDeals]", error);
    return { success: false, error: "Fırsatlar yüklenirken bir hata oluştu." };
  }
}

export async function updateDealStage(
  dealId: string,
  stage: DealStage,
): Promise<ActionResult<DealCardData>> {
  try {
    if (!dealId.trim()) {
      return { success: false, error: "Geçersiz fırsat kimliği." };
    }

    if (!isDealStage(stage)) {
      return { success: false, error: "Geçersiz aşama." };
    }

    const agent = await requireCurrentAgent();

    const existing = await prisma.deal.findFirst({
      where: { id: dealId, ...agentOwnershipFilter(agent.id) },
    });

    if (!existing) {
      return { success: false, error: "Fırsat bulunamadı." };
    }

    const deal = await prisma.deal.update({
      where: { id: dealId },
      data: { stage },
      include: { client: true, property: true },
    });

    revalidatePath(DEALS_PATH);
    return { success: true, data: serializeDeal(deal) };
  } catch (error) {
    console.error("[updateDealStage]", error);
    return { success: false, error: "Aşama güncellenirken bir hata oluştu." };
  }
}

function parsePropertyPrice(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function saveDealCard(
  deal: DealCardData,
): Promise<ActionResult<DealCardData>> {
  try {
    if (!deal.id.trim() || deal.id.startsWith("mock-") || deal.id.startsWith("crm-")) {
      return { success: false, error: "Geçersiz fırsat kimliği." };
    }

    if (!isDealStage(deal.stage)) {
      return { success: false, error: "Geçersiz aşama." };
    }

    const agent = await requireCurrentAgent();

    const existingDeal = await prisma.deal.findFirst({
      where: { id: deal.id, ...agentOwnershipFilter(agent.id) },
    });

    if (!existingDeal) {
      return { success: false, error: "Fırsat bulunamadı." };
    }

    const client = await findOrCreateClient({
      adSoyad: deal.client.adSoyad,
      telefon: deal.client.telefon,
      kaynak: deal.client.kaynak,
      butce: deal.client.butce,
      mulkTipi: deal.client.mulkTipi,
    });

    const propertyPrice = parsePropertyPrice(deal.property.fiyat);

    await prisma.$transaction([
      prisma.property.update({
        where: { id: deal.property.id },
        data: {
          ilanBasligi: deal.property.ilanBasligi.trim(),
          fiyat: propertyPrice,
          il: deal.property.il || "—",
          ilce: deal.property.ilce || "—",
          mahalle: deal.property.mahalle,
          metrekare: deal.property.metrekare,
          odaSayisi: deal.property.odaSayisi,
          tur: deal.property.tur === "FSBO" ? "FSBO" : "YETKILI",
        },
      }),
      prisma.deal.update({
        where: { id: deal.id },
        data: {
          stage: deal.stage,
          notlar: deal.notlar,
          clientId: client.id,
          etiket: deal.etiket ?? null,
          sonIletisim: deal.sonIletisim ?? null,
          budgetTL: deal.budgetTL ?? null,
          tasks: deal.tasks ?? undefined,
          listingUrl: deal.listingUrl ?? null,
          listingIntel: deal.listingIntel ?? undefined,
        },
      }),
    ]);

    const saved = await prisma.deal.findUnique({
      where: { id: deal.id },
      include: { client: true, property: true },
    });

    if (!saved) {
      return { success: false, error: "Fırsat kaydedilemedi." };
    }

    revalidatePath(DEALS_PATH);
    return { success: true, data: serializeDeal(saved) };
  } catch (error) {
    console.error("[saveDealCard]", error);
    return { success: false, error: "Fırsat kaydedilirken bir hata oluştu." };
  }
}

export async function toggleDealTaskAction(
  dealId: string,
  taskId: string,
  completed: boolean,
): Promise<ActionResult<{ dealId: string; taskId: string; completed: boolean }>> {
  try {
    if (!dealId.trim() || !taskId.trim()) {
      return { success: false, error: "Geçersiz görev veya fırsat kimliği." };
    }

    const agent = await requireCurrentAgent();

    const deal = await prisma.deal.findFirst({
      where: { id: dealId, ...agentOwnershipFilter(agent.id) },
      select: { id: true, tasks: true },
    });

    if (!deal) {
      return { success: false, error: "Fırsat bulunamadı." };
    }

    const tasks = parseDealTasks(deal.tasks) ?? DEFAULT_DEAL_TASKS;
    const nextTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed } : task,
    );

    if (!nextTasks.some((task) => task.id === taskId)) {
      return { success: false, error: "Görev bulunamadı." };
    }

    await prisma.deal.update({
      where: { id: dealId },
      data: { tasks: nextTasks },
    });

    revalidatePath(DEALS_PATH);
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { dealId, taskId, completed },
    };
  } catch (error) {
    console.error("[toggleDealTaskAction]", error);
    return {
      success: false,
      error: "Görev güncellenirken bir hata oluştu.",
    };
  }
}

export async function updateDeal(
  dealId: string,
  input: { notlar?: string | null; stage?: DealStage },
): Promise<ActionResult<DealCardData>> {
  try {
    if (!dealId.trim()) {
      return { success: false, error: "Geçersiz fırsat kimliği." };
    }

    if (input.stage && !isDealStage(input.stage)) {
      return { success: false, error: "Geçersiz aşama." };
    }

    const deal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        ...(input.notlar !== undefined ? { notlar: input.notlar } : {}),
        ...(input.stage ? { stage: input.stage } : {}),
      },
      include: { client: true, property: true },
    });

    revalidatePath(DEALS_PATH);
    return { success: true, data: serializeDeal(deal) };
  } catch (error) {
    console.error("[updateDeal]", error);
    return { success: false, error: "Fırsat güncellenirken bir hata oluştu." };
  }
}

export interface CreateDealInput {
  clientId: string;
  propertyId: string;
  stage?: DealStage;
  notlar?: string | null;
}

export async function createDeal(
  input: CreateDealInput,
): Promise<ActionResult<DealCardData>> {
  try {
    if (!input.clientId.trim() || !input.propertyId.trim()) {
      return { success: false, error: "Müşteri ve portföy seçimi zorunludur." };
    }

    const agent = await requireCurrentAgent();

    const [clientAccess, propertyAccess] = await Promise.all([
      assertClientLinkableByAgent(input.clientId.trim(), agent.id),
      resolvePropertyAgentAccess(input.propertyId.trim(), agent.id),
    ]);

    if (clientAccess === "not_found" || clientAccess === "forbidden") {
      return { success: false, error: "Müşteri bulunamadı." };
    }

    if (propertyAccess === "not_found" || propertyAccess === "not_linked") {
      return { success: false, error: "Portföy bulunamadı." };
    }

    const [client, property] = await Promise.all([
      prisma.client.findUnique({ where: { id: input.clientId.trim() } }),
      prisma.property.findUnique({ where: { id: input.propertyId.trim() } }),
    ]);

    if (!client || !property) {
      return { success: false, error: "Müşteri veya portföy bulunamadı." };
    }

    const deal = await prisma.deal.create({
      data: {
        clientId: input.clientId,
        propertyId: input.propertyId,
        stage: input.stage ?? "LEAD",
        notlar: input.notlar ?? null,
        agentId: agent.id,
      },
      include: { client: true, property: true },
    });

    revalidatePath(DEALS_PATH);
    return { success: true, data: serializeDeal(deal) };
  } catch (error) {
    console.error("[createDeal]", error);
    return { success: false, error: "Fırsat oluşturulurken bir hata oluştu." };
  }
}

export interface CreatePropertyInput {
  ilanBasligi: string;
  fiyat?: number | null;
  il: string;
  ilce: string;
  mahalle?: string | null;
  ada?: string | null;
  parsel?: string | null;
  metrekare?: number | null;
  odaSayisi?: string | null;
  durum: PropertyListingStatus;
  tur: PropertyOwnershipType;
}

export async function createProperty(
  input: CreatePropertyInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const property = await prisma.property.create({
      data: {
        ilanBasligi: input.ilanBasligi.trim(),
        fiyat: input.fiyat ?? null,
        il: input.il.trim(),
        ilce: input.ilce.trim(),
        mahalle: input.mahalle?.trim() || null,
        ada: input.ada?.trim() || null,
        parsel: input.parsel?.trim() || null,
        metrekare: input.metrekare ?? null,
        odaSayisi: input.odaSayisi?.trim() || null,
        durum: input.durum,
        tur: input.tur,
      },
    });

    revalidatePath(DEALS_PATH);
    return { success: true, data: { id: property.id } };
  } catch (error) {
    console.error("[createProperty]", error);
    return { success: false, error: "Portföy oluşturulurken bir hata oluştu." };
  }
}

export async function createDealWithDefaults(): Promise<
  ActionResult<DealCardData>
> {
  try {
    const agent = await requireCurrentAgent();

    const client = await prisma.client.create({
      data: {
        adSoyad: "Yeni Müşteri",
        kaynak: "Pipeline",
      },
    });

    const property = await prisma.property.create({
      data: {
        ilanBasligi: "Yeni Portföy",
        il: "—",
        ilce: "—",
        durum: "SATILIK",
        tur: "YETKILI",
      },
    });

    const deal = await prisma.deal.create({
      data: {
        clientId: client.id,
        propertyId: property.id,
        agentId: agent.id,
        stage: "LEAD",
        sonIletisim: "Bugün",
        tasks: DEFAULT_DEAL_TASKS,
      },
      include: { client: true, property: true },
    });

    revalidatePath(DEALS_PATH);
    return { success: true, data: serializeDeal(deal) };
  } catch (error) {
    console.error("[createDealWithDefaults]", error);
    return {
      success: false,
      error: "Yeni fırsat oluşturulurken bir hata oluştu.",
    };
  }
}

export async function deleteDeal(
  dealId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!dealId.trim()) {
      return { success: false, error: "Geçersiz fırsat kimliği." };
    }

    const agent = await requireCurrentAgent();

    const existing = await prisma.deal.findFirst({
      where: { id: dealId, ...agentOwnershipFilter(agent.id) },
    });

    if (!existing) {
      return { success: false, error: "Fırsat bulunamadı." };
    }

    await prisma.deal.delete({ where: { id: dealId } });

    revalidatePath(DEALS_PATH);
    return { success: true, data: { id: dealId } };
  } catch (error) {
    console.error("[deleteDeal]", error);
    return { success: false, error: "Fırsat silinirken bir hata oluştu." };
  }
}

export async function getDealNotes(
  dealId: string,
): Promise<ActionResult<DealNoteData[]>> {
  try {
    if (!dealId?.trim()) {
      return { success: false, error: "Geçersiz fırsat kimliği." };
    }

    const agent = await requireCurrentAgent();

    const deal = await prisma.deal.findFirst({
      where: { id: dealId.trim(), ...agentOwnershipFilter(agent.id) },
    });

    if (!deal) {
      return { success: false, error: "Fırsat bulunamadı." };
    }

    const notes = await prisma.dealNote.findMany({
      where: { dealId: deal.id },
      orderBy: { olusturulmaTarihi: "desc" },
    });

    return {
      success: true,
      data: notes.map((note) => ({
        id: note.id,
        dealId: note.dealId,
        content: note.content,
        olusturulmaTarihi: note.olusturulmaTarihi.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[getDealNotes]", error);
    const message =
      error instanceof Error ? error.message : "Bilinmeyen hata";
    if (message.includes("Oturum açmanız")) {
      return { success: false, error: message };
    }
    return { success: false, error: "Notlar yüklenirken bir hata oluştu." };
  }
}

export async function addDealNote(
  dealId: string,
  content: string,
): Promise<ActionResult<DealNoteData>> {
  try {
    const trimmed = content.trim();
    if (!trimmed) {
      return { success: false, error: "Not içeriği boş olamaz." };
    }

    if (!dealId?.trim()) {
      return { success: false, error: "Geçersiz fırsat kimliği." };
    }

    const agent = await requireCurrentAgent();

    const deal = await prisma.deal.findFirst({
      where: { id: dealId.trim(), ...agentOwnershipFilter(agent.id) },
    });

    if (!deal) {
      return { success: false, error: "Fırsat bulunamadı." };
    }

    const note = await prisma.dealNote.create({
      data: { dealId: deal.id, content: trimmed },
    });

    revalidatePath(DEALS_PATH);
    return {
      success: true,
      data: {
        id: note.id,
        dealId: note.dealId,
        content: note.content,
        olusturulmaTarihi: note.olusturulmaTarihi.toISOString(),
      },
    };
  } catch (error) {
    console.error("[addDealNote]", error);
    return { success: false, error: "Not eklenirken bir hata oluştu." };
  }
}

export async function deleteDealNote(
  noteId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const agent = await requireCurrentAgent();

    const note = await prisma.dealNote.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return { success: false, error: "Not bulunamadı." };
    }

    const deal = await prisma.deal.findFirst({
      where: { id: note.dealId, ...agentOwnershipFilter(agent.id) },
    });

    if (!deal) {
      return { success: false, error: "Not bulunamadı." };
    }

    await prisma.dealNote.delete({ where: { id: noteId } });

    revalidatePath(DEALS_PATH);
    return { success: true, data: { id: noteId } };
  } catch (error) {
    console.error("[deleteDealNote]", error);
    return { success: false, error: "Not silinirken bir hata oluştu." };
  }
}

export async function getFsboMatchesForDeal(
  dealId: string,
): Promise<ActionResult<FsboDealMatch[]>> {
  try {
    const agent = await requireCurrentAgent();

    const deal = await prisma.deal.findFirst({
      where: { id: dealId, ...agentOwnershipFilter(agent.id) },
      include: { client: true, property: true },
    });

    if (!deal) {
      return { success: false, error: "Fırsat bulunamadı." };
    }

    const leads = await prisma.fsboLead.findMany({
      where: {
        isDiscarded: false,
        promotedDealId: null,
        ...agentOwnershipFilter(agent.id),
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    });

    const dealCard = serializeDealBridge(deal);
    const matches = matchFsboLeadsForDeal(
      dealCard,
      leads.map(serializeFsboLead),
    );

    return { success: true, data: matches };
  } catch (error) {
    console.error("[getFsboMatchesForDeal]", error);
    return {
      success: false,
      error: "FSBO eşleşmeleri yüklenirken bir hata oluştu.",
    };
  }
}

export async function attachFsboToDeal(
  dealId: string,
  leadId: string,
): Promise<ActionResult<DealCardData>> {
  try {
    const agent = await requireCurrentAgent();

    const [deal, lead] = await Promise.all([
      prisma.deal.findFirst({
        where: { id: dealId, ...agentOwnershipFilter(agent.id) },
        include: { client: true, property: true },
      }),
      prisma.fsboLead.findFirst({
        where: { id: leadId, ...agentOwnershipFilter(agent.id) },
      }),
    ]);

    if (!deal || !lead || lead.isDiscarded) {
      return { success: false, error: "Fırsat veya FSBO ilanı bulunamadı." };
    }

    const price = lead.price > 0 ? lead.price : null;
    const budgetLabel =
      price && !Number.isNaN(price)
        ? new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            maximumFractionDigits: 0,
          }).format(price)
        : null;

    const platform = fsboPlatformDisplayName(lead.source);
    const systemNote = `🤖 Sistem: ${platform}'deki "${lead.title}" bu müşteriyle eşleştirildi ve takibe alındı.`;

    await prisma.$transaction([
      prisma.client.update({
        where: { id: deal.clientId },
        data: {
          butce: budgetLabel ?? deal.client.butce,
          mulkTipi: lead.location ?? lead.region,
        },
      }),
      prisma.property.update({
        where: { id: deal.propertyId },
        data: {
          ilanBasligi: lead.title,
          fiyat: price,
          il: lead.il ?? deal.property.il,
          ilce: lead.ilce ?? deal.property.ilce,
          mahalle: lead.mahalle,
          metrekare: lead.metrekare,
          odaSayisi: lead.odaSayisi,
          tur: "FSBO",
        },
      }),
      prisma.dealNote.create({
        data: {
          dealId,
          content: systemNote,
        },
      }),
      prisma.deal.update({
        where: { id: dealId },
        data: {
          etiket: "FSBO",
          fsboLeadId: lead.id,
          budgetTL: price ? Math.round(price) : deal.budgetTL,
          listingUrl: lead.url,
          listingIntel: {
            fiyat: budgetLabel ?? "—",
            ilanTarihi: new Intl.DateTimeFormat("tr-TR", {
              dateStyle: "medium",
            }).format(lead.listedAt ?? new Date()),
            metrekare: lead.metrekare ? `${lead.metrekare} m²` : "—",
            source: lead.source,
            title: lead.title,
            location: lead.location ?? lead.region,
          },
        },
      }),
    ]);

    const saved = await prisma.deal.findUnique({
      where: { id: dealId },
      include: { client: true, property: true },
    });

    if (!saved) {
      return { success: false, error: "Fırsat güncellenemedi." };
    }

    revalidatePath(DEALS_PATH);
    return { success: true, data: serializeDeal(saved) };
  } catch (error) {
    console.error("[attachFsboToDeal]", error);
    return {
      success: false,
      error: "FSBO ilanı fırsata bağlanırken bir hata oluştu.",
    };
  }
}
