import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { getMostRecentlyActiveAgent } from "@/lib/auth/agent";
import { prisma } from "@/lib/prisma";

type BotSyncSpecs = {
  m2?: number;
  brutM2?: number;
  netM2?: number;
  odaSayisi?: string;
  ilanNo?: string;
  binaYasi?: string;
  isitmaTipi?: string;
};

type BotSyncListingInput = {
  title?: string;
  price?: number;
  url?: string;
  source?: string;
  images?: string[];
  specs?: BotSyncSpecs | null;
  region?: string;
  il?: string;
  ilce?: string;
  location?: string;
  metrekare?: number;
  odaSayisi?: string;
  listingNo?: string;
  islemTipi?: string;
  kategori?: string;
};

type BotSyncRequestBody = {
  listings?: BotSyncListingInput[];
  listing?: BotSyncListingInput;
};

function getBotSecret(): string | null {
  return (
    process.env.BOT_SECRET_KEY?.trim() ||
    process.env.BOT_SYNC_SECRET?.trim() ||
    null
  );
}

function isAuthorized(request: Request): boolean {
  const secret = getBotSecret();
  if (!secret) {
    console.error("[bot-sync] BOT_SECRET_KEY tanımlı değil.");
    return false;
  }

  const headerSecret = request.headers.get("x-bot-secret");
  if (headerSecret === secret) return true;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeSpecs(specs: BotSyncSpecs | null | undefined): Prisma.InputJsonValue | undefined {
  if (!isRecord(specs)) return undefined;

  return {
    ...specs,
    brutM2: specs.brutM2 ?? specs.m2 ?? undefined,
    odaSayisi: specs.odaSayisi ?? undefined,
  };
}

function parseRegionParts(region: string): { il: string | null; ilce: string | null } {
  const parts = region
    .split(/[\/,]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return { il: parts[0], ilce: parts[1] };
  }

  return { il: null, ilce: parts[0] ?? null };
}

function normalizeListing(raw: BotSyncListingInput): BotSyncListingInput | null {
  const title = raw.title?.trim();
  const url = raw.url?.trim();
  const region = raw.region?.trim();
  const price = Number(raw.price);

  if (!title || !url || !region || !Number.isFinite(price) || price <= 0) {
    return null;
  }

  const images = Array.isArray(raw.images)
    ? raw.images.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  const regionParts = parseRegionParts(region);

  return {
    title,
    url,
    region,
    price: Math.round(price),
    source: raw.source?.trim() || "sahibinden",
    images,
    specs: raw.specs ?? null,
    il: raw.il?.trim() || regionParts.il || undefined,
    ilce: raw.ilce?.trim() || regionParts.ilce || undefined,
    location: raw.location?.trim() || region,
    metrekare:
      raw.metrekare ??
      (typeof raw.specs?.m2 === "number" ? raw.specs.m2 : raw.specs?.brutM2),
    odaSayisi: raw.odaSayisi ?? raw.specs?.odaSayisi,
    listingNo: raw.listingNo,
    islemTipi: raw.islemTipi ?? "SATILIK",
    kategori: raw.kategori ?? "KONUT",
  };
}

function extractListings(body: BotSyncRequestBody): BotSyncListingInput[] {
  if (Array.isArray(body.listings)) return body.listings;
  if (body.listing) return [body.listing];
  return [];
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz bot isteği." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as BotSyncRequestBody;
    const rawListings = extractListings(body);

    if (rawListings.length === 0) {
      return NextResponse.json({
        success: true,
        inserted: 0,
        updated: 0,
        skipped: 0,
        message: "Boş ilan listesi alındı.",
      });
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const activeAgent = await getMostRecentlyActiveAgent();
    const assignAgentId = activeAgent?.id ?? null;

    for (const raw of rawListings) {
      const listing = normalizeListing(raw);

      if (!listing?.url || !listing.title || !listing.price || !listing.region) {
        skipped += 1;
        console.error("[bot-sync] Geçersiz ilan atlandı:", raw.url ?? raw.title);
        continue;
      }

      try {
        const specs = normalizeSpecs(listing.specs);
        const existing = await prisma.fsboLead.findUnique({
          where: { url: listing.url },
          select: { id: true },
        });

        await prisma.fsboLead.upsert({
          where: { url: listing.url },
          update: {
            price: listing.price,
            ...(listing.images && listing.images.length > 0
              ? { images: listing.images }
              : {}),
            ...(specs ? { specs } : {}),
            title: listing.title,
            source: listing.source,
            region: listing.region,
            metrekare: listing.metrekare ?? undefined,
            odaSayisi: listing.odaSayisi ?? undefined,
            listingNo: listing.listingNo ?? undefined,
            islemTipi: listing.islemTipi ?? undefined,
            kategori: listing.kategori ?? undefined,
            location: listing.location,
            il: listing.il,
            ilce: listing.ilce,
          },
          create: {
            title: listing.title,
            price: listing.price,
            url: listing.url,
            source: listing.source ?? "sahibinden",
            images: listing.images ?? [],
            specs,
            region: listing.region,
            isRead: false,
            location: listing.location,
            il: listing.il,
            ilce: listing.ilce,
            metrekare: listing.metrekare ?? null,
            odaSayisi: listing.odaSayisi ?? null,
            listingNo: listing.listingNo ?? null,
            islemTipi: listing.islemTipi ?? "SATILIK",
            kategori: listing.kategori ?? "KONUT",
            description: `${listing.title}. ${listing.region} bölgesinde scraper-bot kaydı.`,
            isDiscarded: false,
            listedAt: new Date(),
            agentId: assignAgentId,
          },
        });

        if (existing) {
          updated += 1;
        } else {
          inserted += 1;
        }
      } catch (error) {
        skipped += 1;
        console.error("[bot-sync] upsert başarısız:", listing.url, error);
      }
    }

    return NextResponse.json({
      success: inserted + updated > 0,
      inserted,
      updated,
      skipped,
      total: rawListings.length,
    });
  } catch (error) {
    console.error("[POST /api/bot-sync]", error);
    return NextResponse.json(
      { error: "Bot senkronizasyonu başarısız." },
      { status: 500 },
    );
  }
}
