import "server-only";

import { requireCurrentAgent } from "@/lib/auth/agent";
import { formatFullTRY } from "@/lib/types/deal";

import { findAuthorizedPropertyForAgent, listAuthorizedPropertiesForAgent } from "./portfolio-access";
import { mapPropertyToPortfolio } from "./portfolio-mapper";
import type { AuthorizedPortfolioItem } from "./portfolio-types";

const MOCK_NOW = "2026-06-14T12:00:00.000Z";

const MOCK_PORTFOLIOS: AuthorizedPortfolioItem[] = [
  {
    id: "portfolio-mock-1",
    title: "Gölcük Merkez 4+1 Dubleks",
    location: "Kocaeli, Gölcük Merkez",
    priceTL: 7_850_000,
    priceFormatted: formatFullTRY(7_850_000),
    listingType: "SATILIK",
    propertyKind: "konut",
    rooms: "4+1",
    sqm: 185,
    buildingAge: "8 yıl",
    showingsCount: 14,
    offersCount: 2,
    yetkiTotalDays: 45,
    yetkiRemainingDays: 28,
    ownerName: "Murat Yılmaz",
    ownerPhone: "905321234567",
    dealStageLabel: "Gösterim",
    updatedAt: MOCK_NOW,
    lastActivityAt: MOCK_NOW,
  },
  {
    id: "portfolio-mock-2",
    title: "Başiskele Sahil 3+1 Sıfır Daire",
    location: "Kocaeli, Başiskele Kirazpınar",
    priceTL: 6_200_000,
    priceFormatted: formatFullTRY(6_200_000),
    listingType: "SATILIK",
    propertyKind: "konut",
    rooms: "3+1",
    sqm: 142,
    buildingAge: "Sıfır",
    showingsCount: 9,
    offersCount: 1,
    yetkiTotalDays: 30,
    yetkiRemainingDays: 11,
    ownerName: "Selin Demir",
    ownerPhone: "905339876543",
    dealStageLabel: "Teklif",
    updatedAt: MOCK_NOW,
    lastActivityAt: MOCK_NOW,
  },
  {
    id: "portfolio-mock-3",
    title: "İzmit Sanayi Ticari İmarlı Arsa",
    location: "Kocaeli, İzmit Sanayi",
    priceTL: 15_000_000,
    priceFormatted: formatFullTRY(15_000_000),
    listingType: "SATILIK",
    propertyKind: "arsa",
    rooms: "—",
    sqm: 1_240,
    buildingAge: "—",
    showingsCount: 6,
    offersCount: 0,
    yetkiTotalDays: 90,
    yetkiRemainingDays: 62,
    ownerName: "Caner Aktaş",
    ownerPhone: "905551112233",
    dealStageLabel: "Aday",
    updatedAt: MOCK_NOW,
    lastActivityAt: MOCK_NOW,
  },
  {
    id: "portfolio-mock-4",
    title: "Gölcük Oluklu İmarlı Arsa",
    location: "Kocaeli, Gölcük Oluklu",
    priceTL: 8_500_000,
    priceFormatted: formatFullTRY(8_500_000),
    listingType: "SATILIK",
    propertyKind: "arsa",
    rooms: "—",
    sqm: 890,
    buildingAge: "—",
    showingsCount: 11,
    offersCount: 3,
    yetkiTotalDays: 60,
    yetkiRemainingDays: 8,
    ownerName: "Ahmet Kaya",
    ownerPhone: "905447778899",
    dealStageLabel: "Teklif",
    updatedAt: MOCK_NOW,
    lastActivityAt: MOCK_NOW,
  },
  {
    id: "portfolio-mock-5",
    title: "Gebze 2+1 Kiralık Daire",
    location: "Kocaeli, Gebze Hükümet",
    priceTL: 22_500,
    priceFormatted: formatFullTRY(22_500),
    listingType: "KIRALIK",
    propertyKind: "konut",
    rooms: "2+1",
    sqm: 98,
    buildingAge: "12 yıl",
    showingsCount: 18,
    offersCount: 4,
    yetkiTotalDays: 365,
    yetkiRemainingDays: 214,
    ownerName: "Zeynep Arslan",
    ownerPhone: "905366554433",
    dealStageLabel: "Gösterim",
    updatedAt: MOCK_NOW,
    lastActivityAt: MOCK_NOW,
  },
];

export type { AuthorizedPortfolioItem } from "./portfolio-types";

function isPortfolioDemoDataEnabled() {
  return process.env.PARSELOS_DEMO_DATA === "1";
}

export async function getAuthorizedPortfolios(): Promise<AuthorizedPortfolioItem[]> {
  try {
    const agent = await requireCurrentAgent();
    const properties = await listAuthorizedPropertiesForAgent(agent.id);
    return properties.map(mapPropertyToPortfolio);
  } catch (error) {
    console.error("[getAuthorizedPortfolios]", error);
    if (isPortfolioDemoDataEnabled()) {
      return MOCK_PORTFOLIOS;
    }
    return [];
  }
}

export async function getAuthorizedPortfolioById(
  propertyId: string,
): Promise<AuthorizedPortfolioItem | null> {
  const agent = await requireCurrentAgent();
  const property = await findAuthorizedPropertyForAgent(agent.id, propertyId);
  if (!property) return null;
  return mapPropertyToPortfolio(property);
}
