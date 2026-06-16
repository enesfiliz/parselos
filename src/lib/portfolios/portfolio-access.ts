import "server-only";

import { agentOwnershipFilter } from "@/lib/auth/agent";
import { prisma } from "@/lib/prisma";

const agentDealSelect = {
  id: true,
  stage: true,
  guncellenmeTarihi: true,
  client: {
    select: { id: true, adSoyad: true, telefon: true },
  },
} as const;

function agentScopedDealsInclude(agentId: string) {
  return {
    where: agentOwnershipFilter(agentId),
    select: agentDealSelect,
    orderBy: { olusturulmaTarihi: "asc" as const },
  };
}

export async function findAuthorizedPropertyForAgent(
  agentId: string,
  propertyId: string,
) {
  return prisma.property.findFirst({
    where: {
      id: propertyId,
      tur: "YETKILI",
      deals: {
        some: agentOwnershipFilter(agentId),
      },
    },
    include: {
      deals: agentScopedDealsInclude(agentId),
    },
  });
}

export async function listAuthorizedPropertiesForAgent(agentId: string) {
  return prisma.property.findMany({
    where: {
      tur: "YETKILI",
      deals: {
        some: agentOwnershipFilter(agentId),
      },
    },
    orderBy: { guncellenmeTarihi: "desc" },
    include: {
      deals: agentScopedDealsInclude(agentId),
    },
  });
}
