import "server-only";

import { agentOwnershipFilter } from "@/lib/auth/agent";
import { prisma } from "@/lib/prisma";

const propertyInclude = {
  deals: {
    select: {
      id: true,
      stage: true,
      client: {
        select: { id: true, adSoyad: true, telefon: true },
      },
    },
    orderBy: { olusturulmaTarihi: "asc" as const },
  },
} as const;

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
    include: propertyInclude,
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
      deals: {
        where: agentOwnershipFilter(agentId),
        select: {
          stage: true,
          client: {
            select: { adSoyad: true, telefon: true },
          },
        },
      },
    },
  });
}
