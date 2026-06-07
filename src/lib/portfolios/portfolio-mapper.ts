import type { PropertyListingStatus } from "@prisma/client";

import { formatFullTRY } from "@/lib/types/deal";

import type { AuthorizedPortfolioItem } from "./portfolio-types";

export function locationLabel(property: {
  il: string;
  ilce: string;
  mahalle: string | null;
}) {
  const parts = [property.il, property.ilce, property.mahalle].filter(Boolean);
  return parts.join(", ");
}

export function parseLocationInput(location: string) {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    il: parts[0] ?? "—",
    ilce: parts[1] ?? "—",
    mahalle: parts[2] ?? null,
  };
}

export function inferPropertyKind(
  title: string,
): AuthorizedPortfolioItem["propertyKind"] {
  const lower = title.toLocaleLowerCase("tr-TR");
  if (
    lower.includes("arsa") ||
    lower.includes("parsel") ||
    lower.includes("imarlı")
  ) {
    return "arsa";
  }
  if (
    lower.includes("ticari") ||
    lower.includes("dükkan") ||
    lower.includes("ofis")
  ) {
    return "ticari";
  }
  return "konut";
}

function inferRoomsFromTitle(title: string) {
  const match = title.match(/\d\+\d/);
  return match?.[0] ?? "—";
}

function inferBuildingAge(title: string) {
  const lower = title.toLocaleLowerCase("tr-TR");
  if (lower.includes("sıfır") || lower.includes("sifir")) return "Sıfır";
  const match = lower.match(/(\d+)\s*yıl/);
  if (match) return `${match[1]} yıl`;
  return "—";
}

function yetkiFromPropertyId(id: string, createdAt: Date) {
  const seed = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const totalDays = 60 + (seed % 31);
  const elapsedDays = Math.floor(
    (Date.now() - createdAt.getTime()) / 86_400_000,
  );
  const remaining = Math.max(0, totalDays - elapsedDays);
  return { totalDays, remaining };
}

function countDealStages(deals: Array<{ stage: string }>, stage: string) {
  return deals.filter((deal) => deal.stage === stage).length;
}

export function mapPropertyToPortfolio(
  property: {
    id: string;
    ilanBasligi: string;
    fiyat: unknown;
    il: string;
    ilce: string;
    mahalle: string | null;
    metrekare: number | null;
    odaSayisi: string | null;
    aciklama: string | null;
    binaYasi: string | null;
    kapakGorseli: string | null;
    durum: PropertyListingStatus;
    olusturulmaTarihi: Date;
    deals: Array<{
      stage: string;
      client: { adSoyad: string; telefon: string | null };
    }>;
  },
): AuthorizedPortfolioItem {
  const priceTL = property.fiyat ? Number(property.fiyat) : 0;
  const yetki = yetkiFromPropertyId(property.id, property.olusturulmaTarihi);
  const primaryClient = property.deals[0]?.client;

  return {
    id: property.id,
    title: property.ilanBasligi,
    location: locationLabel(property),
    priceTL: Number.isNaN(priceTL) ? 0 : priceTL,
    priceFormatted: formatFullTRY(Number.isNaN(priceTL) ? 0 : priceTL),
    listingType: property.durum,
    propertyKind: inferPropertyKind(property.ilanBasligi),
    rooms: property.odaSayisi ?? inferRoomsFromTitle(property.ilanBasligi),
    sqm: property.metrekare ?? 0,
    buildingAge:
      property.binaYasi?.trim() ||
      inferBuildingAge(property.ilanBasligi),
    description: property.aciklama?.trim() || undefined,
    coverImageUrl: property.kapakGorseli?.trim() || undefined,
    showingsCount: countDealStages(property.deals, "SHOWING"),
    offersCount: countDealStages(property.deals, "OFFER"),
    yetkiTotalDays: yetki.totalDays,
    yetkiRemainingDays: yetki.remaining,
    ownerName: primaryClient?.adSoyad ?? "Mal Sahibi",
    ownerPhone: primaryClient?.telefon?.replace(/\D/g, "") ?? "",
  };
}

export function parsePriceTL(price: string) {
  const digits = price.replace(/[^\d]/g, "");
  const value = Number(digits);
  return Number.isNaN(value) ? 0 : value;
}
