import type { Client, Property } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_LIMIT = 10;
const DEFAULT_MIN_SCORE = 55;
import { MATCH_DISPLAY_THRESHOLD } from "@/lib/types/deal";

export { MATCH_DISPLAY_THRESHOLD };
const BUDGET_TOLERANCE = 0.1;

type MatchClient = Pick<
  Client,
  "id" | "adSoyad" | "telefon" | "email" | "notlar" | "butce" | "mulkTipi"
>;

type MatchProperty = Pick<
  Property,
  "id" | "ilanBasligi" | "fiyat" | "il" | "ilce" | "mahalle" | "odaSayisi"
>;

export type PropertyCustomerMatch = {
  client: MatchClient;
  property: MatchProperty;
  score: number;
  breakdown: {
    budget: number;
    location: number;
    room: number;
    propertyType: number;
  };
  reasons: string[];
};

export type FindPropertyMatchesOptions = {
  limit?: number;
  minScore?: number;
  excludeClientId?: string;
};

function normalizeText(value: string | null | undefined) {
  return (
    value
      ?.toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim() ?? ""
  );
}

function decimalToNumber(value: MatchProperty["fiyat"]) {
  if (value === null) return null;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
}

export function parseBudgetRange(value: string | null | undefined) {
  const text = value?.toLocaleLowerCase("tr-TR").trim() ?? "";
  if (!text) return null;

  const numbers = Array.from(
    text.matchAll(/(\d[\d.,]*)(?:\s*(milyon|mn|m|bin|k))?/gu),
  )
    .map(([, raw, suffix]) => parseMoneyToken(raw, suffix))
    .filter((number) => Number.isFinite(number) && number > 0);

  if (numbers.length === 0) return null;

  const min = Math.min(...numbers);
  const max = Math.max(...numbers);

  if (
    /\b(max|maksimum|kadar|butce|altinda|altı|en fazla)\b/u.test(text) ||
    numbers.length === 1
  ) {
    return { min: 0, max };
  }

  return { min, max };
}

function parseMoneyToken(raw: string, suffix: string | undefined) {
  const hasDot = raw.includes(".");
  const hasComma = raw.includes(",");
  let normalized = raw;

  if (hasDot && hasComma) {
    const decimalSeparator = raw.lastIndexOf(",") > raw.lastIndexOf(".") ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";

    normalized = raw
      .replaceAll(thousandsSeparator, "")
      .replace(decimalSeparator, ".");
  } else if (hasDot) {
    normalized = raw.split(".").every((part, index) => index === 0 || part.length === 3)
      ? raw.replaceAll(".", "")
      : raw.replace(".", ".");
  } else if (hasComma) {
    normalized = raw.split(",").every((part, index) => index === 0 || part.length === 3)
      ? raw.replaceAll(",", "")
      : raw.replace(",", ".");
  }

  const baseValue = Number(normalized);
  const normalizedSuffix = normalizeText(suffix);

  if (normalizedSuffix === "milyon" || normalizedSuffix === "mn" || normalizedSuffix === "m") {
    return baseValue * 1_000_000;
  }

  if (normalizedSuffix === "bin" || normalizedSuffix === "k") {
    return baseValue * 1_000;
  }

  return baseValue;
}

function scoreBudget(
  propertyPrice: MatchProperty["fiyat"],
  clientBudget: string | null,
) {
  const price = decimalToNumber(propertyPrice);
  const budget = parseBudgetRange(clientBudget);

  if (!price || !budget) {
    return { score: 35, reason: "Bütçe bilgisi eksik olduğu için nötr skor." };
  }

  const toleratedMin = budget.min * (1 - BUDGET_TOLERANCE);
  const toleratedMax = budget.max * (1 + BUDGET_TOLERANCE);

  if (price >= toleratedMin && price <= toleratedMax) {
    const midpoint = budget.min > 0 ? (budget.min + budget.max) / 2 : budget.max;
    const distanceRatio = Math.abs(price - midpoint) / Math.max(midpoint, 1);
    const score = Math.max(82, 100 - distanceRatio * 45);

    return {
      score,
      reason: `Fiyat müşterinin bütçe toleransı içinde: ${Math.round(score)}/100.`,
    };
  }

  const nearestBoundary = price < toleratedMin ? toleratedMin : toleratedMax;
  const missRatio = Math.abs(price - nearestBoundary) / Math.max(nearestBoundary, 1);
  const score = Math.max(0, 70 - missRatio * 140);

  return {
    score,
    reason:
      price > toleratedMax
        ? "Fiyat bütçe üst sınırının üzerinde."
        : "Fiyat bütçe alt beklentisinin altında.",
  };
}

function scoreLocation(property: MatchProperty, client: MatchClient) {
  const preference = normalizeText(
    [client.mulkTipi, client.butce, client.notlar].join(" "),
  );
  const il = normalizeText(property.il);
  const ilce = normalizeText(property.ilce);
  const mahalle = normalizeText(property.mahalle);

  if (!preference && !il && !ilce) {
    return { score: 45, reason: "Lokasyon tercihi kayıtta açık değil." };
  }

  if (mahalle && preference.includes(mahalle)) {
    return { score: 100, reason: "Mahalle tercihi ile tam uyum." };
  }

  if (ilce && preference.includes(ilce)) {
    return { score: 86, reason: "İlçe tercihi ile güçlü uyum." };
  }

  if (il && preference.includes(il)) {
    return { score: 68, reason: "İl tercihi ile genel uyum." };
  }

  const propertyLocation = normalizeText(
    [property.mahalle, property.ilce, property.il].filter(Boolean).join(" "),
  );
  if (
    propertyLocation &&
    preference &&
    propertyLocation.split(" ").some((token) => token.length > 2 && preference.includes(token))
  ) {
    return { score: 72, reason: "Lokasyon anahtar kelimeleri kısmen uyumlu." };
  }

  return { score: 35, reason: "Lokasyon tercihiyle açık eşleşme bulunamadı." };
}

function parseRoomCount(value: string | null | undefined) {
  const normalized = normalizeText(value);
  const match = normalized.match(/(\d+)\s*\+\s*(\d+)/u);

  if (match) {
    return Number(match[1]) + Number(match[2]);
  }

  const firstNumber = normalized.match(/\d+/u)?.[0];
  return firstNumber ? Number(firstNumber) : null;
}

function scoreRoom(propertyRoom: string | null, client: MatchClient) {
  const propertyRooms = parseRoomCount(propertyRoom);
  const preferredRooms = parseRoomCount(client.mulkTipi);

  if (!propertyRooms || !preferredRooms) {
    return { score: 50, reason: "Oda sayısı tercihi eksik olduğu için nötr skor." };
  }

  const difference = Math.abs(propertyRooms - preferredRooms);
  const score = Math.max(0, 100 - difference * 25);

  return {
    score,
    reason:
      difference === 0
        ? "Oda sayısı beklentiyle birebir uyumlu."
        : `Oda sayısı beklentiden ${difference} seviye farklı.`,
  };
}

function scorePropertyType(property: MatchProperty, client: MatchClient) {
  const preference = normalizeText(client.mulkTipi);
  const title = normalizeText(property.ilanBasligi);

  if (!preference) {
    return { score: 50, reason: "Mülk tipi tercihi eksik olduğu için nötr skor." };
  }

  const typeKeywords = [
    "daire",
    "villa",
    "arsa",
    "tarla",
    "ofis",
    "dukkan",
    "rezidans",
    "mustakil",
  ];

  const preferredTypes = typeKeywords.filter((keyword) =>
    preference.includes(keyword),
  );

  if (preferredTypes.length === 0) {
    return { score: 55, reason: "Mülk tipi serbest veya yapılandırılmamış." };
  }

  const matchedType = preferredTypes.find((keyword) => title.includes(keyword));

  return matchedType
    ? { score: 100, reason: `Mülk tipi uyumlu: ${matchedType}.` }
    : { score: 25, reason: "Mülk tipi tercihi ilan başlığıyla uyuşmuyor." };
}

export function scoreClientForProperty(
  client: MatchClient,
  property: MatchProperty,
): PropertyCustomerMatch {
  const budget = scoreBudget(property.fiyat, client.butce);
  const location = scoreLocation(property, client);
  const room = scoreRoom(property.odaSayisi, client);
  const propertyType = scorePropertyType(property, client);

  const score =
    budget.score * 0.4 +
    location.score * 0.28 +
    room.score * 0.18 +
    propertyType.score * 0.14;

  return {
    client,
    property,
    score: Math.round(Math.min(100, Math.max(0, score))),
    breakdown: {
      budget: Math.round(budget.score),
      location: Math.round(location.score),
      room: Math.round(room.score),
      propertyType: Math.round(propertyType.score),
    },
    reasons: [budget.reason, location.reason, room.reason, propertyType.reason],
  };
}

export async function findPotentialBuyersForProperty(
  propertyId: string,
  options: FindPropertyMatchesOptions = {},
) {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      ilanBasligi: true,
      fiyat: true,
      il: true,
      ilce: true,
      mahalle: true,
      odaSayisi: true,
    },
  });

  if (!property) {
    throw new Error(`Property not found: ${propertyId}`);
  }

  const clients = await prisma.client.findMany({
    where: options.excludeClientId
      ? { id: { not: options.excludeClientId } }
      : undefined,
    select: {
      id: true,
      adSoyad: true,
      telefon: true,
      email: true,
      notlar: true,
      butce: true,
      mulkTipi: true,
    },
  });

  return clients
    .filter((client) => !client.adSoyad.startsWith("FSBO —"))
    .map((client) => scoreClientForProperty(client, property))
    .filter((match) => match.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
