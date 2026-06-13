import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";

export const METRIC_CARD =
  "parsel-surface flex min-h-[88px] flex-col justify-between rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm";

export type ListingFilter = "ALL" | "SATILIK" | "KIRALIK";
export type KindFilter = "ALL" | AuthorizedPortfolioItem["propertyKind"];

export function isMockPortfolio(id: string) {
  return id.startsWith("portfolio-mock-");
}

export function extractAdaParsel(title: string, description?: string) {
  const text = `${title} ${description ?? ""}`;
  const slash = text.match(/(\d{1,5})\s*\/\s*(\d{1,5})/);
  if (slash) return `${slash[1]} / ${slash[2]}`;

  const ada = text.match(/ada[:\s]*(\d+)/i);
  const parsel = text.match(/parsel[:\s]*(\d+)/i);
  if (ada && parsel) return `Ada ${ada[1]} · Parsel ${parsel[1]}`;

  return null;
}

export function extractImarLabel(
  title: string,
  kind: AuthorizedPortfolioItem["propertyKind"],
) {
  const lower = title.toLocaleLowerCase("tr-TR");
  if (lower.includes("imarlı arsa") || lower.includes("imarli arsa")) {
    return "İmarlı arsa";
  }
  if (lower.includes("ticari imar")) return "Ticari imar";
  if (lower.includes("konut imar")) return "Konut imarı";
  if (kind === "arsa") return lower.includes("imar") ? "İmarlı arsa" : "Arsa";
  if (kind === "ticari") return "Ticari";
  return "Konut";
}

export function getListingBadge(listingType: AuthorizedPortfolioItem["listingType"]) {
  const isSale = listingType === "SATILIK";
  return {
    label: listingType,
    className: isSale
      ? "border-parsel-gold/30 bg-parsel-gold/15 text-parsel-gold"
      : "border-primary/25 bg-primary/10 text-primary",
  };
}

export function getYetkiStatus(remaining: number) {
  if (remaining < 15) {
    return {
      label: `${remaining} gün`,
      detail: "Yetki kritik",
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }
  if (remaining < 30) {
    return {
      label: `${remaining} gün`,
      detail: "Yetki yakın",
      className: "border-parsel-gold/30 bg-parsel-gold/10 text-parsel-gold",
    };
  }
  return {
    label: `${remaining} gün`,
    detail: "Yetki aktif",
    className: "border-border/60 bg-parsel-elevated text-muted-foreground",
  };
}

export function computePortfolioMetrics(items: AuthorizedPortfolioItem[]) {
  const forSale = items.filter((item) => item.listingType === "SATILIK").length;
  const forRent = items.filter((item) => item.listingType === "KIRALIK").length;
  const urgentYetki = items.filter((item) => item.yetkiRemainingDays < 15).length;

  return {
    total: items.length,
    forSale,
    forRent,
    urgentYetki,
  };
}

export function matchesPortfolioQuery(
  item: AuthorizedPortfolioItem,
  query: string,
) {
  const q = query.trim().toLocaleLowerCase("tr-TR");
  if (!q) return true;

  const imar = extractImarLabel(item.title, item.propertyKind);
  const adaParsel = extractAdaParsel(item.title, item.description);

  const haystack = [
    item.title,
    item.location,
    item.priceFormatted,
    item.listingType,
    item.propertyKind,
    imar,
    adaParsel,
    item.rooms,
    item.buildingAge,
    item.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("tr-TR");

  return haystack.includes(q);
}

export function matchesPortfolioFilters(
  item: AuthorizedPortfolioItem,
  listingFilter: ListingFilter,
  kindFilter: KindFilter,
) {
  if (listingFilter !== "ALL" && item.listingType !== listingFilter) return false;
  if (kindFilter !== "ALL" && item.propertyKind !== kindFilter) return false;
  return true;
}
