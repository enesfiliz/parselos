import type { TenantPlanType } from "@prisma/client";

export type BillablePlan = Extract<TenantPlanType, "PRO" | "PREMIUM">;

export const BILLING_PLANS: Record<
  BillablePlan,
  {
    label: string;
    priceLabel: string;
    description: string;
    features: string[];
  }
> = {
  PRO: {
    label: "Pro",
    priceLabel: "₺990 / ay",
    description: "Aktif danışmanlar için AI destekli operasyon paketi.",
    features: [
      "AI İlan Analizi",
      "WhatsApp Mesaj Otonomisi",
      "50 portföy limiti",
      "Parsel AI 500 kredi",
    ],
  },
  PREMIUM: {
    label: "Premium",
    priceLabel: "₺1.990 / ay",
    description: "Yüksek hacimli ofisler için tam otonomi.",
    features: [
      "Tüm Pro özellikleri",
      "Öncelikli AI motoru",
      "200 portföy limiti",
      "Parsel AI 2000 kredi",
    ],
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
