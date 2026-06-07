import {
  inferPropertyKind,
  parsePriceTL,
} from "@/lib/portfolios/portfolio-mapper";
import type { AuthorizedPortfolioItem } from "@/lib/portfolios/portfolio-types";
import { formatFullTRY } from "@/lib/types/deal";
import type { PropertyListingStatus } from "@prisma/client";

export type PortfolioFormValues = {
  title: string;
  price: string;
  location: string;
  sqm: string;
  rooms: string;
  listingType: PropertyListingStatus;
  buildingAge: string;
  ownerName: string;
  ownerPhone: string;
  description: string;
  coverImageUrl: string;
};

export const EMPTY_PORTFOLIO_FORM: PortfolioFormValues = {
  title: "",
  price: "",
  location: "",
  sqm: "",
  rooms: "",
  listingType: "SATILIK",
  buildingAge: "",
  ownerName: "",
  ownerPhone: "",
  description: "",
  coverImageUrl: "",
};

export function portfolioToFormValues(
  item: AuthorizedPortfolioItem,
): PortfolioFormValues {
  return {
    title: item.title,
    price: item.priceFormatted,
    location: item.location,
    sqm: item.sqm > 0 ? String(item.sqm) : "",
    rooms: item.rooms !== "—" ? item.rooms : "",
    listingType: item.listingType,
    buildingAge: item.buildingAge !== "—" ? item.buildingAge : "",
    ownerName: item.ownerName,
    ownerPhone: item.ownerPhone,
    description: item.description ?? "",
    coverImageUrl: item.coverImageUrl ?? "",
  };
}

export function formValuesToPortfolioItem(
  values: PortfolioFormValues,
  existing?: AuthorizedPortfolioItem,
): AuthorizedPortfolioItem {
  const priceTL = parsePriceTL(values.price);
  const sqm = values.sqm ? Number(values.sqm) : 0;

  return {
    id: existing?.id ?? `portfolio-local-${Date.now()}`,
    title: values.title.trim(),
    location: values.location.trim(),
    priceTL,
    priceFormatted: formatFullTRY(priceTL),
    listingType: values.listingType,
    propertyKind: existing?.propertyKind ?? inferPropertyKind(values.title),
    rooms: values.rooms.trim() || "—",
    sqm: Number.isNaN(sqm) ? 0 : sqm,
    buildingAge: values.buildingAge.trim() || "—",
    description: values.description.trim() || undefined,
    coverImageUrl: values.coverImageUrl.trim() || undefined,
    showingsCount: existing?.showingsCount ?? 0,
    offersCount: existing?.offersCount ?? 0,
    yetkiTotalDays: existing?.yetkiTotalDays ?? 60,
    yetkiRemainingDays: existing?.yetkiRemainingDays ?? 60,
    ownerName: values.ownerName.trim() || "Mal Sahibi",
    ownerPhone: values.ownerPhone.trim(),
  };
}

export function propertyKindLabel(kind: AuthorizedPortfolioItem["propertyKind"]) {
  switch (kind) {
    case "arsa":
      return "Arsa";
    case "ticari":
      return "Ticari";
    default:
      return "Konut";
  }
}
