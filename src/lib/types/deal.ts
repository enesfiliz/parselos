import type { DealStage } from "@prisma/client";

export type DealStageId = DealStage;

export const DEAL_STAGES: {
  id: DealStage;
  label: string;
  description: string;
}[] = [
  { id: "LEAD", label: "Potansiyel", description: "Yeni lead ve ilk temas" },
  { id: "SHOWING", label: "Gösterim", description: "Yer gösterimi planlandı" },
  { id: "OFFER", label: "Teklif", description: "Teklif aşamasında" },
  { id: "WON", label: "Başarılı", description: "Satış / kiralama tamamlandı" },
  { id: "LOST", label: "Kayıp", description: "Fırsat kapanmadı" },
];

export const ADVANCED_DEAL_STAGES = new Set<DealStage>(["OFFER", "WON"]);

export const DEAL_ETIKETLER = [
  "Acil",
  "Krediye Uygun",
  "Yatırım",
  "Kiralık",
  "FSBO",
] as const;

export type DealTask = {
  id: string;
  label: string;
  completed: boolean;
};

export type DealNoteData = {
  id: string;
  dealId: string;
  content: string;
  olusturulmaTarihi: string;
};

export function taskProgress(deal: DealCardData) {
  const tasks = deal.tasks ?? [];
  if (tasks.length === 0) return null;
  const done = tasks.filter((t) => t.completed).length;
  return { done, total: tasks.length };
}

export type ListingIntel = {
  fiyat: string;
  ilanTarihi: string;
  metrekare: string;
  source?: string;
  title?: string;
  location?: string;
};

export const MATCH_DISPLAY_THRESHOLD = 80;

export type BuyerMatch = {
  clientId: string;
  adSoyad: string;
  telefon: string | null;
  score: number;
  reasons: string[];
  matchedAt: string;
};

export const DEFAULT_DEAL_TASKS: DealTask[] = [
  { id: "task-tapu-harci", label: "Tapu harcı sorulacak", completed: false },
  { id: "task-musteri-ara", label: "Müşteri aranacak", completed: false },
  { id: "task-kapora", label: "Kapora teyidi alınacak", completed: false },
];

export interface DealCardData {
  id: string;
  stage: DealStage;
  notlar: string | null;
  olusturulmaTarihi: string;
  guncellenmeTarihi: string;
  /** Pipeline etiketi — Acil, Krediye Uygun vb. */
  etiket?: string | null;
  /** İnsan okunur son temas — "2 gün önce" */
  sonIletisim?: string | null;
  /** Sütun hacmi hesabı için sayısal bütçe (TL) */
  budgetTL?: number | null;
  /** Operasyonel görev listesi */
  tasks?: DealTask[];
  /** Dış ilan bağlantısı (Sahibinden / Emlakjet) */
  listingUrl?: string | null;
  /** Kaynak FSBO lead kimliği */
  fsboLeadId?: string | null;
  /** Çekilmiş ilan istihbaratı */
  listingIntel?: ListingIntel | null;
  /** Otomatik müşteri eşleştirme (%80+ uyum) */
  buyerMatch?: BuyerMatch | null;
  client: {
    id: string;
    adSoyad: string;
    telefon: string | null;
    email: string | null;
    kaynak: string | null;
    butce: string | null;
    mulkTipi: string | null;
  };
  property: {
    id: string;
    ilanBasligi: string;
    fiyat: string | null;
    il: string;
    ilce: string;
    mahalle: string | null;
    ada: string | null;
    parsel: string | null;
    durum: string;
    tur: string;
    odaSayisi: string | null;
    metrekare: number | null;
  };
}

export type MoveDealOptimisticAction = {
  dealId: string;
  stage: DealStage;
};

export function applyOptimisticDealMove(
  deals: DealCardData[],
  action: MoveDealOptimisticAction,
): DealCardData[] {
  return deals.map((deal) =>
    deal.id === action.dealId
      ? {
          ...deal,
          stage: action.stage,
          guncellenmeTarihi: new Date().toISOString(),
        }
      : deal,
  );
}

export function daysInCurrentStage(updatedAt: string) {
  const diffMs = Date.now() - new Date(updatedAt).getTime();
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatPortfolioRef(property: DealCardData["property"]) {
  if (property.ada && property.parsel) {
    return `${property.ada} Ada · ${property.parsel} Parsel`;
  }
  return `#${property.id.slice(0, 8).toUpperCase()}`;
}

export function resolveDealBudgetTL(deal: DealCardData): number {
  if (deal.budgetTL && deal.budgetTL > 0) return deal.budgetTL;

  const butceDigits = deal.client.butce?.replace(/[^\d]/g, "");
  if (butceDigits) {
    const parsed = Number(butceDigits);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }

  const fiyat = deal.property.fiyat ? Number(deal.property.fiyat) : 0;
  return Number.isNaN(fiyat) ? 0 : fiyat;
}

export function formatCompactTRY(amount: number) {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const formatted =
      millions >= 10
        ? millions.toFixed(0)
        : millions.toFixed(1).replace(".", ",");
    return `₺${formatted}M`;
  }

  if (amount >= 1_000) {
    return `₺${Math.round(amount / 1_000)}K`;
  }

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatFullTRY(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function sumDealsBudget(deals: DealCardData[]) {
  return deals.reduce((total, deal) => total + resolveDealBudgetTL(deal), 0);
}
