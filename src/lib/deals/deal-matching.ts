import { prisma } from "@/lib/prisma";
import { findPotentialBuyersForProperty } from "@/lib/property-matching";
import { MATCH_DISPLAY_THRESHOLD } from "@/lib/types/deal";
import type { BuyerMatch } from "@/lib/types/deal";

export async function runBuyerMatchForDeal(
  dealId: string,
): Promise<BuyerMatch | null> {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { id: true, clientId: true, propertyId: true },
  });

  if (!deal) return null;

  const matches = await findPotentialBuyersForProperty(deal.propertyId, {
    limit: 1,
    minScore: MATCH_DISPLAY_THRESHOLD,
    excludeClientId: deal.clientId,
  });

  const top = matches[0];
  if (!top || top.score < MATCH_DISPLAY_THRESHOLD) return null;

  const buyerMatch: BuyerMatch = {
    clientId: top.client.id,
    adSoyad: top.client.adSoyad,
    telefon: top.client.telefon,
    score: top.score,
    reasons: top.reasons,
    matchedAt: new Date().toISOString(),
  };

  await prisma.deal.update({
    where: { id: dealId },
    data: { buyerMatch },
  });

  return buyerMatch;
}
