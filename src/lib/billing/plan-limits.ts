import "server-only";

import type { TenantPlanType } from "@/lib/account/types";

export type PlanLimitConfig = {
  maxPortfolios: number | null;
  maxClients: number | null;
  monthlyListingImports: number | null;
};

export const PLAN_LIMITS: Record<TenantPlanType, PlanLimitConfig> = {
  FREE: {
    maxPortfolios: 2,
    maxClients: 8,
    monthlyListingImports: 3,
  },
  PRO: {
    maxPortfolios: null,
    maxClients: null,
    monthlyListingImports: null,
  },
  PREMIUM: {
    maxPortfolios: null,
    maxClients: null,
    monthlyListingImports: null,
  },
};

export function getPlanLimits(planType: TenantPlanType): PlanLimitConfig {
  return PLAN_LIMITS[planType] ?? PLAN_LIMITS.FREE;
}

export function planLimitError(
  resource: "portföy" | "müşteri" | "ilan içe aktarma",
  limit: number,
) {
  return `Başlangıç paketinde en fazla ${limit} ${resource} kullanabilirsiniz. Danışman paketine geçerek sınırı kaldırın.`;
}
