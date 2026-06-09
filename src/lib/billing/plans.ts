import type { TenantPlanType } from "@/lib/account/types";
import { PLAN_CATALOG } from "@/lib/billing/plan-catalog";

export type BillablePlan = Extract<TenantPlanType, "PRO" | "PREMIUM">;

export const BILLING_PLANS: Record<
  BillablePlan,
  {
    label: string;
    priceLabel: string;
    description: string;
    features: string[];
    priceMonthly: number;
    annualNote?: string;
  }
> = {
  PRO: {
    label: PLAN_CATALOG.PRO.marketingName,
    priceLabel: `${PLAN_CATALOG.PRO.priceLabel} / ay`,
    description: PLAN_CATALOG.PRO.tagline,
    features: PLAN_CATALOG.PRO.features,
    priceMonthly: PLAN_CATALOG.PRO.priceMonthly,
    annualNote: PLAN_CATALOG.PRO.annualNote,
  },
  PREMIUM: {
    label: PLAN_CATALOG.PREMIUM.marketingName,
    priceLabel: `${PLAN_CATALOG.PREMIUM.priceLabel} / ay`,
    description: PLAN_CATALOG.PREMIUM.tagline,
    features: PLAN_CATALOG.PREMIUM.features,
    priceMonthly: PLAN_CATALOG.PREMIUM.priceMonthly,
    annualNote: PLAN_CATALOG.PREMIUM.annualNote,
  },
};

export function pricingPlanReferenceFor(plan: BillablePlan) {
  const envKey =
    plan === "PRO" ? "IYZICO_PRO_PLAN_REFERENCE" : "IYZICO_PREMIUM_PLAN_REFERENCE";
  const reference = process.env[envKey]?.trim();

  if (!reference) {
    throw new Error(`${envKey} ortam değişkeni tanımlı değil.`);
  }

  return reference;
}

export function planTypeFromPricingReference(
  pricingPlanReference: string | null | undefined,
): TenantPlanType | null {
  if (!pricingPlanReference) return null;

  const proRef = process.env.IYZICO_PRO_PLAN_REFERENCE?.trim();
  const premiumRef = process.env.IYZICO_PREMIUM_PLAN_REFERENCE?.trim();

  if (proRef && pricingPlanReference === proRef) return "PRO";
  if (premiumRef && pricingPlanReference === premiumRef) return "PREMIUM";
  return null;
}

export function isProFeaturePlan(planType: TenantPlanType) {
  return planType === "PRO" || planType === "PREMIUM";
}
