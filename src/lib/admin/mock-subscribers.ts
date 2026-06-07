export type SubscriberPlan = "Pro" | "Premium" | "Starter";

export type SubscriberStatus = "active" | "passive" | "blocked" | "suspended";

export type AdminSubscriberRecord = {
  id: string;
  name: string;
  email: string;
  plan: SubscriberPlan;
  aiTokensUsed: number;
  dealCount: number;
  status: SubscriberStatus;
  lastLoginLabel: string;
};

export const ADMIN_SUBSCRIBER_RECORDS: AdminSubscriberRecord[] = [
  {
    id: "tenant-001",
    name: "Enes Filiz Emlak",
    email: "enes@filizemlak.com.tr",
    plan: "Premium",
    aiTokensUsed: 184_200,
    dealCount: 47,
    status: "active",
    lastLoginLabel: "31 May 2026 · 14:22",
  },
  {
    id: "tenant-002",
    name: "Murat Kaya Gayrimenkul",
    email: "murat@kayaportfoy.com",
    plan: "Pro",
    aiTokensUsed: 92_400,
    dealCount: 31,
    status: "active",
    lastLoginLabel: "31 May 2026 · 11:08",
  },
  {
    id: "tenant-003",
    name: "Selin Demir Ofis",
    email: "selin@demiroffice.io",
    plan: "Pro",
    aiTokensUsed: 61_800,
    dealCount: 22,
    status: "active",
    lastLoginLabel: "30 May 2026 · 19:41",
  },
  {
    id: "tenant-004",
    name: "Kocaeli Portföy Danışmanlık",
    email: "info@kocaeliportfoy.com",
    plan: "Premium",
    aiTokensUsed: 128_600,
    dealCount: 38,
    status: "active",
    lastLoginLabel: "30 May 2026 · 16:15",
  },
  {
    id: "tenant-005",
    name: "Gebze Yatırım Grubu",
    email: "iletisim@gebzeyatirim.com",
    plan: "Starter",
    aiTokensUsed: 12_300,
    dealCount: 6,
    status: "passive",
    lastLoginLabel: "28 May 2026 · 09:02",
  },
  {
    id: "tenant-006",
    name: "İzmit Merkez Emlak",
    email: "destek@izmitmerkez.com",
    plan: "Pro",
    aiTokensUsed: 44_900,
    dealCount: 19,
    status: "suspended",
    lastLoginLabel: "25 May 2026 · 13:54",
  },
  {
    id: "tenant-007",
    name: "Bilecik Söğüt Arsa Ofisi",
    email: "ofis@sogutarsa.com.tr",
    plan: "Premium",
    aiTokensUsed: 76_100,
    dealCount: 14,
    status: "active",
    lastLoginLabel: "29 May 2026 · 10:37",
  },
  {
    id: "tenant-008",
    name: "Anadolu Tapu & Danışmanlık",
    email: "admin@anadolutapu.net",
    plan: "Pro",
    aiTokensUsed: 8_400,
    dealCount: 3,
    status: "blocked",
    lastLoginLabel: "12 May 2026 · 08:11",
  },
  {
    id: "tenant-009",
    name: "Gölcük Sahil Konut",
    email: "hello@golcuksahil.com",
    plan: "Starter",
    aiTokensUsed: 19_700,
    dealCount: 9,
    status: "passive",
    lastLoginLabel: "27 May 2026 · 17:28",
  },
  {
    id: "tenant-010",
    name: "Moda Emlak İstanbul",
    email: "ops@modaemlak.co",
    plan: "Premium",
    aiTokensUsed: 210_500,
    dealCount: 52,
    status: "active",
    lastLoginLabel: "31 May 2026 · 08:55",
  },
];

export type SubscriberPlanFilter = "all" | SubscriberPlan | "suspended";

export function formatTokenCount(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }
  return String(value);
}
