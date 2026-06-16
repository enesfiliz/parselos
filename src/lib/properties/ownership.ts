import "server-only";

import { prisma } from "@/lib/prisma";

/** Property global tablo — geçici izolasyon: agent'a ait bir Deal üzerinden bağlı mı? */
export async function isPropertyLinkedToAgent(
  propertyId: string,
  agentId: string,
): Promise<boolean> {
  const deal = await prisma.deal.findFirst({
    where: { propertyId, agentId },
    select: { id: true },
  });
  return deal !== null;
}

export type PropertyMutationAccess = {
  exists: boolean;
  ownedByAgent: boolean;
  linkedToOtherAgents: boolean;
  canMutate: boolean;
};

/**
 * Property satırını güncellemeden önce — başka agent deal'ları veya orphan bağlantılar var mı?
 */
export async function resolvePropertyMutationAccess(
  propertyId: string,
  agentId: string,
): Promise<PropertyMutationAccess> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) {
    return {
      exists: false,
      ownedByAgent: false,
      linkedToOtherAgents: false,
      canMutate: false,
    };
  }

  const deals = await prisma.deal.findMany({
    where: { propertyId },
    select: { agentId: true },
  });

  if (deals.length === 0) {
    return {
      exists: true,
      ownedByAgent: false,
      linkedToOtherAgents: false,
      canMutate: false,
    };
  }

  const ownedByAgent = deals.some((deal) => deal.agentId === agentId);
  const linkedToOtherAgents = deals.some(
    (deal) => deal.agentId !== null && deal.agentId !== agentId,
  );
  const canMutate =
    ownedByAgent && deals.every((deal) => deal.agentId === agentId);

  return {
    exists: true,
    ownedByAgent,
    linkedToOtherAgents,
    canMutate,
  };
}

export async function resolvePropertyAgentAccess(
  propertyId: string,
  agentId: string,
): Promise<"not_found" | "not_linked" | "linked"> {
  const access = await resolvePropertyMutationAccess(propertyId, agentId);

  if (!access.exists) return "not_found";
  if (!access.ownedByAgent) return "not_linked";
  return "linked";
}

export const PROPERTY_SHARED_MUTATION_ERROR =
  "Bu portföy başka kayıtlarla paylaşıldığı için düzenlenemez.";

export const PROPERTY_SWITCH_ERROR =
  "Bu portföy başka bir kayıtla ilişkilendirilemez.";
