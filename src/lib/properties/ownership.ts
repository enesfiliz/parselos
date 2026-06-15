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

export async function resolvePropertyAgentAccess(
  propertyId: string,
  agentId: string,
): Promise<"not_found" | "not_linked" | "linked"> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) return "not_found";

  const linked = await isPropertyLinkedToAgent(propertyId, agentId);
  return linked ? "linked" : "not_linked";
}
