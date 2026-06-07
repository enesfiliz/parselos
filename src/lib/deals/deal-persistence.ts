import type { DealCardData } from "@/lib/types/deal";

const MOCK_DEALS_STORAGE_KEY = "parselos:mock-deals";

export function isMockDealId(dealId: string): boolean {
  return dealId.startsWith("mock-");
}

export function loadPersistedMockDeals(
  defaultDeals: DealCardData[],
): DealCardData[] {
  if (typeof window === "undefined") return defaultDeals;

  try {
    const raw = localStorage.getItem(MOCK_DEALS_STORAGE_KEY);
    if (!raw) return defaultDeals;

    const stored = JSON.parse(raw) as DealCardData[];
    if (!Array.isArray(stored)) return defaultDeals;

    const storedMap = new Map(stored.map((deal) => [deal.id, deal]));
    const mergedDefaults = defaultDeals.map(
      (deal) => storedMap.get(deal.id) ?? deal,
    );
    const defaultIds = new Set(defaultDeals.map((deal) => deal.id));
    const extras = stored.filter((deal) => !defaultIds.has(deal.id));
    return [...extras, ...mergedDefaults];
  } catch {
    return defaultDeals;
  }
}

export function persistMockDeals(deals: DealCardData[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(MOCK_DEALS_STORAGE_KEY, JSON.stringify(deals));
  } catch {
    // localStorage dolu veya devre dışı — sessizce geç
  }
}

export function appendMockDeal(deal: DealCardData): void {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(MOCK_DEALS_STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as DealCardData[]) : [];
    const next = [deal, ...(Array.isArray(stored) ? stored : [])];
    localStorage.setItem(MOCK_DEALS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("parselos:mock-deals-updated"));
  } catch {
    // sessizce geç
  }
}
