import { NextResponse } from "next/server";

import { runFsboScraperSync } from "@/lib/fsbo/fsbo-sync-service";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
  }

  try {
    const { leads, stats, message } = await runFsboScraperSync();

    return NextResponse.json({
      success: leads.length > 0,
      synced: leads.length,
      leads,
      stats,
      message,
      note: "ScraperAPI + Cheerio ile canlı FSBO senkronizasyonu.",
    });
  } catch (error) {
    console.error("[GET /api/cron/fsbo-sync]", error);
    return NextResponse.json(
      { error: "FSBO senkronizasyonu başarısız." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
