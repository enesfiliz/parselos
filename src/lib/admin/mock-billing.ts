export type AdminBillingSubscriber = {
  id: string;
  name: string;
  email: string;
  plan: "Pro" | "Premium" | "Free";
  startDate: string;
  nextPaymentDate: string;
  mrrTL: number;
  status: "active" | "pending" | "cancelled";
};

export type AdminBillingMetrics = {
  monthlyRevenue: string;
  monthlyRevenueChange: string;
  cancellationRate: string;
  cancellationChange: string;
  pendingPayments: string;
  pendingCount: number;
};

export const ADMIN_BILLING_METRICS: AdminBillingMetrics = {
  monthlyRevenue: "₺42.500",
  monthlyRevenueChange: "+8.4% geçen aya göre",
  cancellationRate: "%2.1",
  cancellationChange: "-0.6 puan iyileşme",
  pendingPayments: "₺3.960",
  pendingCount: 4,
};

export const ADMIN_ACTIVE_BILLING_SUBSCRIBERS: AdminBillingSubscriber[] = [
  {
    id: "bill-001",
    name: "Enes Filiz Emlak",
    email: "enes@filizemlak.com.tr",
    plan: "Premium",
    startDate: "12 Oca 2026",
    nextPaymentDate: "12 Haz 2026",
    mrrTL: 1_990,
    status: "active",
  },
  {
    id: "bill-002",
    name: "Murat Kaya Gayrimenkul",
    email: "murat@kayaportfoy.com",
    plan: "Pro",
    startDate: "03 Şub 2026",
    nextPaymentDate: "03 Haz 2026",
    mrrTL: 990,
    status: "active",
  },
  {
    id: "bill-003",
    name: "Selin Demir Ofis",
    email: "selin@demiroffice.io",
    plan: "Pro",
    startDate: "18 Mar 2026",
    nextPaymentDate: "18 Haz 2026",
    mrrTL: 990,
    status: "pending",
  },
  {
    id: "bill-004",
    name: "Anadolu Tapu & Danışmanlık",
    email: "info@anadolutapu.com",
    plan: "Premium",
    startDate: "27 Nis 2026",
    nextPaymentDate: "27 Haz 2026",
    mrrTL: 1_990,
    status: "active",
  },
  {
    id: "bill-005",
    name: "Gebze Portföy Merkezi",
    email: "iletisim@gebzeportfoy.com",
    plan: "Pro",
    startDate: "09 May 2026",
    nextPaymentDate: "09 Haz 2026",
    mrrTL: 990,
    status: "active",
  },
  {
    id: "bill-006",
    name: "Körfez Emlak Grubu",
    email: "destek@korfezemlak.com",
    plan: "Premium",
    startDate: "21 May 2026",
    nextPaymentDate: "21 Haz 2026",
    mrrTL: 1_990,
    status: "pending",
  },
];
