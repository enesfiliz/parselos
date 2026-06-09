import type {
  AgentRoleType,
  LicenseVerificationStatus,
  TenantOrganizationType,
  TenantPlanType,
  TenantStatus,
} from "@/lib/account/types";
import { PLAN_CATALOG } from "@/lib/billing/plan-catalog";

export const AGENT_ROLE_LABELS: Record<AgentRoleType, string> = {
  DANISMAN: "Gayrimenkul Danışmanı",
  KURULUS: "Kuruluş Yetkilisi",
  BROKER: "Broker / Ofis Sahibi",
};

export const AGENT_ROLE_SHORT: Record<AgentRoleType, string> = {
  DANISMAN: "Danışman",
  KURULUS: "Kuruluş",
  BROKER: "Broker",
};

export const AGENT_ROLE_DESCRIPTIONS: Record<AgentRoleType, string> = {
  DANISMAN: "Bireysel portföy ve müşteri yönetimi yapan danışman",
  KURULUS: "Şirket veya marka adına işlem yapan yetkili",
  BROKER: "Ofis / brokerlık yapısını yöneten sorumlu",
};

/** Rol rozeti — arka plan, metin, kenarlık */
export const AGENT_ROLE_BADGE_CLASS: Record<AgentRoleType, string> = {
  DANISMAN:
    "bg-sky-500/12 text-sky-700 border-sky-500/25 dark:text-sky-300 dark:bg-sky-500/15",
  KURULUS:
    "bg-violet-500/12 text-violet-700 border-violet-500/25 dark:text-violet-300 dark:bg-violet-500/15",
  BROKER:
    "bg-amber-500/15 text-amber-800 border-amber-500/30 dark:text-amber-300 dark:bg-amber-500/12",
};

export const AGENT_ROLE_ACCENT: Record<AgentRoleType, string> = {
  DANISMAN: "text-sky-600 dark:text-sky-400",
  KURULUS: "text-violet-600 dark:text-violet-400",
  BROKER: "text-amber-600 dark:text-amber-400",
};

export const ORGANIZATION_TYPE_LABELS: Record<TenantOrganizationType, string> = {
  BIREYSEL: "Bireysel Danışman",
  OFIS: "Emlak Ofisi",
  KURULUS: "Kurumsal Yapı",
  BROKERLIK: "Brokerlık",
};

export const PLAN_LABELS: Record<TenantPlanType, string> = {
  FREE: PLAN_CATALOG.FREE.marketingName,
  PRO: PLAN_CATALOG.PRO.marketingName,
  PREMIUM: PLAN_CATALOG.PREMIUM.marketingName,
};

export const PLAN_BADGE_CLASS: Record<TenantPlanType, string> = {
  FREE: "bg-muted text-muted-foreground border-border",
  PRO: "bg-primary/15 text-primary border-primary/30",
  PREMIUM: "bg-parsel-gold/15 text-parsel-gold border-parsel-gold/35",
};

export const STATUS_LABELS: Record<TenantStatus, string> = {
  ACTIVE: "Aktif",
  PENDING: "Beklemede",
  PAST_DUE: "Ödeme Gecikmiş",
  CANCELLED: "İptal",
  TRIAL: "Deneme",
};

export const LICENSE_STATUS_LABELS: Record<LicenseVerificationStatus, string> = {
  NONE: "Gönderilmedi",
  PENDING: "Onay Bekliyor",
  VERIFIED: "Onaylandı",
  REJECTED: "Reddedildi",
};

export const LICENSE_STATUS_BADGE_CLASS: Record<LicenseVerificationStatus, string> = {
  NONE: "bg-muted text-muted-foreground border-border",
  PENDING: "bg-amber-500/12 text-amber-700 border-amber-500/25 dark:text-amber-300",
  VERIFIED: "bg-emerald-500/12 text-emerald-700 border-emerald-500/25 dark:text-emerald-300",
  REJECTED: "bg-red-500/12 text-red-700 border-red-500/25 dark:text-red-300",
};

export const ROLE_TO_ORG_DEFAULT: Record<AgentRoleType, TenantOrganizationType> = {
  DANISMAN: "BIREYSEL",
  KURULUS: "KURULUS",
  BROKER: "BROKERLIK",
};
