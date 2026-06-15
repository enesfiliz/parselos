import "server-only";

import { DealStage, type Prisma } from "@prisma/client";

import { requireCurrentAgent } from "@/lib/auth/agent";
import { resolveClientRegionAndType } from "@/lib/clients/portfolio-hints";
import { prisma } from "@/lib/prisma";
import { DEFAULT_DEAL_TASKS } from "@/lib/types/deal";

const ACTIVE_DEAL_STAGES: DealStage[] = ["LEAD", "SHOWING", "OFFER"];
const FSBO_PHANTOM_PREFIX = "FSBO —";

/** Client global tablo — geçici izolasyon: yalnızca bu agent'a ait deal'i olan müşteriler. */
export function clientsForAgentWhere(agentId: string): Prisma.ClientWhereInput {
  return {
    NOT: { adSoyad: { startsWith: FSBO_PHANTOM_PREFIX } },
    deals: { some: { agentId } },
  };
}

export async function isClientOwnedByAgent(
  clientId: string,
  agentId: string,
): Promise<boolean> {
  const deal = await prisma.deal.findFirst({
    where: { clientId, agentId },
    select: { id: true },
  });
  return deal !== null;
}

export type ClientAgentAccess = "not_found" | "not_owned" | "shared" | "exclusive";

/** Global Client satırı — mutation öncesi paylaşım kontrolü. */
export async function resolveClientAgentAccess(
  clientId: string,
  agentId: string,
): Promise<ClientAgentAccess> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  });

  if (!client) return "not_found";

  const deals = await prisma.deal.findMany({
    where: { clientId },
    select: { agentId: true },
  });

  if (deals.length === 0) return "not_owned";

  const ownedByCurrent = deals.some((deal) => deal.agentId === agentId);
  if (!ownedByCurrent) return "not_owned";

  const exclusivelyCurrent = deals.every((deal) => deal.agentId === agentId);
  return exclusivelyCurrent ? "exclusive" : "shared";
}

export const CLIENT_SHARED_MUTATION_ERROR =
  "Bu müşteri başka kayıtlarla paylaşıldığı için doğrudan düzenlenemez.";

export const CLIENT_DELETE_DISABLED_ERROR =
  "Müşteri silme için güvenli ownership modeli gerekli. Bu işlem geçici olarak devre dışı.";

export const CLIENT_CREATE_REQUIRES_DEAL_ERROR =
  "Müşteri oluşturmak için fırsat bağlamı gerekli. dealId alanı zorunludur.";

export type StandaloneClientInput = {
  adSoyad: string;
  telefon?: string | null;
  email?: string | null;
  notlar?: string | null;
  kaynak?: string | null;
  birthDate?: Date | null;
  butce?: string | null;
  mulkTipi?: string | null;
};

/**
 * Migration olmadan ownership: minimal Property + Deal ile currentAgent'a bağlar.
 * Bağımsız müşteri kaydı (CRM) akışı için kullanılır.
 */
export async function createStandaloneClientForAgent(
  agentId: string,
  input: StandaloneClientInput,
) {
  return prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        adSoyad: input.adSoyad,
        telefon: input.telefon ?? null,
        email: input.email ?? null,
        notlar: input.notlar ?? null,
        kaynak: input.kaynak ?? null,
        birthDate: input.birthDate ?? null,
        butce: input.butce ?? null,
        mulkTipi: input.mulkTipi ?? null,
      },
    });

    const property = await tx.property.create({
      data: {
        ilanBasligi: `${input.adSoyad} — Müşteri kaydı`,
        il: "—",
        ilce: "—",
        durum: "SATILIK",
        tur: "YETKILI",
        aciklama: "Bağımsız müşteri sahiplik kaydı",
      },
    });

    await tx.deal.create({
      data: {
        clientId: client.id,
        propertyId: property.id,
        agentId,
        stage: "LEAD",
        etiket: "Müşteri",
        sonIletisim: "Bugün",
        notlar: "Bağımsız müşteri kaydı",
        tasks: DEFAULT_DEAL_TASKS,
      },
    });

    return client;
  });
}

/** Yeni deal/promote bağlamında client kullanılabilir mi (foreign/orphan değil). */
export async function assertClientLinkableByAgent(
  clientId: string,
  agentId: string,
): Promise<"ok" | "not_found" | "forbidden"> {
  const access = await resolveClientAgentAccess(clientId, agentId);
  if (access === "not_found") return "not_found";
  if (access === "not_owned") return "forbidden";
  return "ok";
}

/**
 * FSBO promote — yeni deal ile ownership kurulacağı için dealsiz client kabul edilir.
 * Yalnızca başka agent'a özel client reddedilir.
 */
export async function assertClientUsableForPromote(
  clientId: string,
  agentId: string,
): Promise<"ok" | "not_found" | "forbidden"> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true },
  });

  if (!client) return "not_found";

  const deals = await prisma.deal.findMany({
    where: { clientId },
    select: { agentId: true },
  });

  if (deals.length === 0) return "ok";

  const hasCurrentAgentDeal = deals.some((deal) => deal.agentId === agentId);
  if (hasCurrentAgentDeal) return "ok";

  return "forbidden";
}

export type CustomerListItem = {
  id: string;
  adSoyad: string;
  telefon: string | null;
  email: string | null;
  notlar: string | null;
  kaynak: string | null;
  butce: string | null;
  mulkTipi: string | null;
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
  aktifFirsatSayisi: number;
  region: string;
  propertyType: string;
};

export async function getCustomersList(): Promise<CustomerListItem[]> {
  const agent = await requireCurrentAgent();

  const clients = await prisma.client.findMany({
    where: clientsForAgentWhere(agent.id),
    orderBy: { olusturulmaTarihi: "desc" },
    include: {
      _count: {
        select: {
          deals: {
            where: {
              agentId: agent.id,
              stage: { in: ACTIVE_DEAL_STAGES },
            },
          },
        },
      },
    },
  });

  return clients.map((client) => {
    const { region, propertyType } = resolveClientRegionAndType(client.mulkTipi);

    return {
      id: client.id,
      adSoyad: client.adSoyad,
      telefon: client.telefon,
      email: client.email,
      notlar: client.notlar,
      kaynak: client.kaynak,
      butce: client.butce,
      mulkTipi: client.mulkTipi,
      olusturulmaTarihi: client.olusturulmaTarihi.toISOString(),
      guncellenmeTarihi: client.guncellenmeTarihi.toISOString(),
      aktifFirsatSayisi: client._count.deals,
      region,
      propertyType,
    };
  });
}
