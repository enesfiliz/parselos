export type AdminMetricCard = {
  id: string;
  label: string;
  value: string;
  change: string;
  changePositive: boolean;
  sparkline: number[];
};

export type AdminSubscriberRow = {
  id: string;
  name: string;
  plan: "Pro" | "Premium" | "Starter";
  lastLogin: string;
  event: "Kayıt" | "Yükseltme" | "Aktif";
};

export type AdminAiLogRow = {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  status: "success" | "pending" | "error";
};

export const ADMIN_METRICS: AdminMetricCard[] = [
  {
    id: "subscribers",
    label: "Toplam Aktif Abone",
    value: "142",
    change: "+12% bu ay",
    changePositive: true,
    sparkline: [98, 104, 108, 115, 121, 128, 134, 138, 142],
  },
  {
    id: "mrr",
    label: "Aylık Tekrarlayan Gelir (MRR)",
    value: "₺42.500",
    change: "+8.4% bu ay",
    changePositive: true,
    sparkline: [31_200, 33_800, 35_100, 36_900, 38_400, 39_800, 40_600, 41_900, 42_500],
  },
  {
    id: "tokens",
    label: "Parsel AI Token Kullanımı",
    value: "1.2M",
    change: "+24% bu ay",
    changePositive: true,
    sparkline: [620_000, 710_000, 780_000, 840_000, 910_000, 980_000, 1_050_000, 1_120_000, 1_200_000],
  },
  {
    id: "errors",
    label: "Sistem Hata / Log Oranı",
    value: "%0.02",
    change: "-0.01% bu ay",
    changePositive: true,
    sparkline: [0.06, 0.05, 0.05, 0.04, 0.04, 0.03, 0.03, 0.02, 0.02],
  },
];

export const ADMIN_SUBSCRIBERS: AdminSubscriberRow[] = [
  {
    id: "sub-1",
    name: "Enes Filiz Emlak",
    plan: "Premium",
    lastLogin: "12 dk önce",
    event: "Aktif",
  },
  {
    id: "sub-2",
    name: "Murat Kaya Gayrimenkul",
    plan: "Pro",
    lastLogin: "1 saat önce",
    event: "Yükseltme",
  },
  {
    id: "sub-3",
    name: "Selin Demir Ofis",
    plan: "Pro",
    lastLogin: "3 saat önce",
    event: "Aktif",
  },
  {
    id: "sub-4",
    name: "Kocaeli Portföy Danışmanlık",
    plan: "Premium",
    lastLogin: "Dün 18:40",
    event: "Kayıt",
  },
  {
    id: "sub-5",
    name: "Gebze Yatırım Grubu",
    plan: "Starter",
    lastLogin: "Dün 09:15",
    event: "Kayıt",
  },
  {
    id: "sub-6",
    name: "İzmit Merkez Emlak",
    plan: "Pro",
    lastLogin: "2 gün önce",
    event: "Aktif",
  },
];

export const ADMIN_AI_LOGS: AdminAiLogRow[] = [
  {
    id: "log-1",
    actor: "Enes Filiz",
    action: "Randevu oluşturdu — Tapu, 14 Haziran",
    timestamp: "Az önce",
    status: "success",
  },
  {
    id: "log-2",
    actor: "Murat Emlak",
    action: "İlan analizi istedi — Gölcük 500 m² arsa",
    timestamp: "2 dk önce",
    status: "success",
  },
  {
    id: "log-3",
    actor: "Selin Demir",
    action: "WhatsApp mesajı üretti — Yer gösterme hatırlatması",
    timestamp: "6 dk önce",
    status: "success",
  },
  {
    id: "log-4",
    actor: "Kocaeli Portföy",
    action: "Portföy özeti çekti — 8 aktif yetkili ilan",
    timestamp: "11 dk önce",
    status: "success",
  },
  {
    id: "log-5",
    actor: "Gebze Yatırım",
    action: "Abonelik bilgisi sorguladı — Pro paket",
    timestamp: "18 dk önce",
    status: "pending",
  },
  {
    id: "log-6",
    actor: "İzmit Merkez",
    action: "Takvim randevusu — Müşteri adı eksik, soru döndü",
    timestamp: "24 dk önce",
    status: "error",
  },
];
