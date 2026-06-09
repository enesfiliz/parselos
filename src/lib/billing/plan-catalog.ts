import type { TenantPlanType } from "@/lib/account/types";

export type PlanCatalogEntry = {
  planType: TenantPlanType;
  id: string;
  marketingName: string;
  tagline: string;
  priceMonthly: number;
  priceLabel: string;
  periodLabel: string;
  annualNote?: string;
  /** Ofis paketi: dahil koltuk */
  includedSeats?: number;
  /** Ofis paketi: ek koltuk aylık ücret */
  extraSeatMonthly?: number;
  highlighted: boolean;
  badge?: string;
  features: string[];
  cta: string;
  billable: boolean;
};

/** ParselOS abonelik kataloğu — landing + panel ortak kaynak */
export const PLAN_CATALOG: Record<TenantPlanType, PlanCatalogEntry> = {
  FREE: {
    planType: "FREE",
    id: "baslangic",
    marketingName: "Başlangıç",
    tagline: "Ürünü tanımak için sınırlı deneme.",
    priceMonthly: 0,
    priceLabel: "Ücretsiz",
    periodLabel: "1 kullanıcı · süresiz",
    highlighted: false,
    features: [
      "2 aktif portföy",
      "8 müşteri kaydı",
      "Ayda 3 ilan linki içe aktarma",
      "Temel pipeline ve ajanda",
      "Topluluk desteği",
    ],
    cta: "Ücretsiz Dene",
    billable: false,
  },
  PRO: {
    planType: "PRO",
    id: "danisman",
    marketingName: "Danışman",
    tagline: "Tek danışman — tam operasyon paketi.",
    priceMonthly: 549,
    priceLabel: "₺549",
    periodLabel: "/ ay · 1 kullanıcı · KDV dahil",
    annualNote: "Yıllık ödemede ₺459/ay",
    highlighted: true,
    badge: "En Popüler",
    features: [
      "1 danışman lisansı (sınırsız portföy)",
      "Tapu AI, ilan asistanı, FSBO",
      "Sınırsız müşteri ve içe aktarma",
      "TTYB yetki rozeti",
      "Öncelikli e-posta desteği",
    ],
    cta: "Danışman Paketine Geç",
    billable: true,
  },
  PREMIUM: {
    planType: "PREMIUM",
    id: "ofis",
    marketingName: "Ofis",
    tagline: "Broker + ekip — ofis başına platform ücreti.",
    priceMonthly: 3990,
    priceLabel: "₺3.990",
    periodLabel: "/ ay · ofis · KDV dahil",
    annualNote: "5 danışman dahil · +₺349/ay ek koltuk",
    includedSeats: 5,
    extraSeatMonthly: 349,
    highlighted: false,
    features: [
      "5 danışman lisansı dahil (broker paneli)",
      "Ek danışman +₺349/ay (20'ye kadar)",
      "Danışman paketindeki tüm modüller",
      "Davet kodu ve ekip yetkileri",
      "Ofis metrikleri · telefon desteği",
    ],
    cta: "Ofis Paketine Geç",
    billable: true,
  },
};

export const LANDING_PRICING_PLANS = [
  PLAN_CATALOG.FREE,
  PLAN_CATALOG.PRO,
  PLAN_CATALOG.PREMIUM,
] as const;

export function planMarketingName(planType: TenantPlanType) {
  return PLAN_CATALOG[planType].marketingName;
}

export function formatOfficePricingNote(plan: PlanCatalogEntry) {
  if (!plan.includedSeats || !plan.extraSeatMonthly) return null;
  return `${plan.includedSeats} danışman dahil · +₺${plan.extraSeatMonthly}/ay ek koltuk`;
}
