import type { DealStage, PropertyListingStatus } from "@prisma/client";

export type AuthorizedPortfolioItem = {
  id: string;
  title: string;
  location: string;
  priceTL: number;
  priceFormatted: string;
  listingType: PropertyListingStatus;
  propertyKind: "konut" | "arsa" | "ticari";
  rooms: string;
  sqm: number;
  buildingAge: string;
  coverImageUrl?: string;
  description?: string;
  showingsCount: number;
  offersCount: number;
  yetkiTotalDays: number;
  yetkiRemainingDays: number;
  ownerName: string;
  ownerPhone: string;
  ownerClientId?: string;
  primaryDealId?: string;
  dealStage?: DealStage;
  dealStageLabel?: string;
  updatedAt: string;
  lastActivityAt: string;
};
