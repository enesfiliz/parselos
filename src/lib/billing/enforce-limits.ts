import "server-only";

import { getPlanLimits, planLimitError } from "@/lib/billing/plan-limits";
import type { TenantPlanType } from "@/lib/account/types";
import { prisma } from "@/lib/prisma";

function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function assertCanCreatePortfolio(planType: TenantPlanType) {
  const limits = getPlanLimits(planType);
  if (limits.maxPortfolios === null) return;

  const count = await prisma.property.count();
  if (count >= limits.maxPortfolios) {
    throw new Error(planLimitError("portföy", limits.maxPortfolios));
  }
}

export async function assertCanCreateClient(planType: TenantPlanType) {
  const limits = getPlanLimits(planType);
  if (limits.maxClients === null) return;

  const count = await prisma.client.count({
    where: { NOT: { adSoyad: { startsWith: "FSBO —" } } },
  });

  if (count >= limits.maxClients) {
    throw new Error(planLimitError("müşteri", limits.maxClients));
  }
}

export async function assertCanImportListing(
  planType: TenantPlanType,
  agentId: string,
  incoming = 1,
) {
  const limits = getPlanLimits(planType);
  if (limits.monthlyListingImports === null) return;

  const count = await prisma.fsboLead.count({
    where: {
      agentId,
      createdAt: { gte: monthStart() },
    },
  });

  if (count + incoming > limits.monthlyListingImports) {
    throw new Error(
      planLimitError("ilan içe aktarma", limits.monthlyListingImports),
    );
  }
}
