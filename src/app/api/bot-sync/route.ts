import { NextResponse } from "next/server";

import { FSBO_BOT_IMPORT_DISABLED_MESSAGE } from "@/lib/fsbo/fsbo-tracking";

type BotSyncListingInput = {
  title?: string;
  price?: number;
  url?: string;
  source?: string;
  images?: string[];
  specs?: Record<string, unknown> | null;
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
  agentId?: string;
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
        fsboAutoImport: "disabled",
        message: "Boş ilan listesi alındı.",
      });
    }

    return NextResponse.json({
      success: false,
      inserted: 0,
      updated: 0,
      skipped: rawListings.length,
      total: rawListings.length,
      fsboAutoImport: "disabled",
      message: FSBO_BOT_IMPORT_DISABLED_MESSAGE,
      manualEndpoint: "/api/fsbo-leads/manual",
    });
  } catch (error) {
    console.error("[POST /api/bot-sync]", error);
    return NextResponse.json(
      { error: "Bot senkronizasyonu başarısız." },
      { status: 500 },
    );
  }
}
