import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";

export const METRIC_CARD =
  "parsel-surface flex min-h-[88px] flex-col justify-between rounded-2xl border border-border/60 bg-parsel-panel p-4 shadow-parsel-sm";

export type ListingFilter = "ALL" | "SATILIK" | "KIRALIK";
export type KindFilter = "ALL" | AuthorizedPortfolioItem["propertyKind"];
export type PortfolioSortKey =
  | "activity_desc"
  | "price_desc"
  | "price_asc"
  | "yetki_asc"
  | "title_asc";

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
  const days = Number.isFinite(remaining) ? Math.max(0, Math.round(remaining)) : 0;
  if (days < 15) {
    return {
      label: `${days} gün`,
      detail: "Yetki kritik",
      className: "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }
  if (days < 30) {
    return {
      label: `${days} gün`,
      detail: "Yetki yakın",
      className: "border-parsel-gold/30 bg-parsel-gold/10 text-parsel-gold",
    };
  }
  return {
    label: `${days} gün`,
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

function parsePriceValue(item: AuthorizedPortfolioItem) {
  const digits = item.priceFormatted.replace(/[^\d]/g, "");
  const value = Number(digits);
  return Number.isFinite(value) ? value : 0;
}

export function sortPortfolioItems(
  items: AuthorizedPortfolioItem[],
  sortKey: PortfolioSortKey,
) {
  const sorted = [...items];
  sorted.sort((a, b) => {
    switch (sortKey) {
      case "price_desc":
        return parsePriceValue(b) - parsePriceValue(a);
      case "price_asc":
        return parsePriceValue(a) - parsePriceValue(b);
      case "yetki_asc":
        return a.yetkiRemainingDays - b.yetkiRemainingDays;
      case "title_asc":
        return a.title.localeCompare(b.title, "tr-TR");
      case "activity_desc":
      default:
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  });
  return sorted;
}

export function hasActivePortfolioFilters(
  query: string,
  listingFilter: ListingFilter,
  kindFilter: KindFilter,
) {
  return (
    query.trim().length > 0 ||
    listingFilter !== "ALL" ||
    kindFilter !== "ALL"
  );
}

export function formatPortfolioLastActivity(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "—";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "Az önce";
  if (diffMinutes < 60) return `${diffMinutes} dk önce`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} sa önce`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} gün önce`;

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function getDealStageBadge(stageLabel?: string) {
  if (!stageLabel) {
    return {
      label: "Fırsat yok",
      className: "border-border/60 bg-parsel-elevated text-muted-foreground",
    };
  }

  const normalized = stageLabel.toLocaleLowerCase("tr-TR");
  if (normalized.includes("kazan")) {
    return {
      label: stageLabel,
      className: "border-primary/25 bg-primary/10 text-primary",
    };
  }
  if (normalized.includes("kayb")) {
    return {
      label: stageLabel,
      className: "border-destructive/25 bg-destructive/10 text-destructive",
    };
  }
  if (normalized.includes("teklif")) {
    return {
      label: stageLabel,
      className: "border-parsel-gold/30 bg-parsel-gold/15 text-parsel-gold",
    };
  }
  if (normalized.includes("gösterim") || normalized.includes("gosterim")) {
    return {
      label: stageLabel,
      className: "border-primary/20 bg-primary/10 text-primary",
    };
  }

  return {
    label: stageLabel,
    className: "border-border/60 bg-parsel-elevated text-muted-foreground",
  };
}
