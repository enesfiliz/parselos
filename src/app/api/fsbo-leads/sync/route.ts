import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { requireCurrentAgent } from "@/lib/auth/agent";
import { runFsboScraperSync } from "@/lib/fsbo/fsbo-sync-service";
import { serializeFsboLead } from "@/lib/fsbo/serialize-lead";
import { prisma } from "@/lib/prisma";

function buildLeadWhere(
  searchParams: URLSearchParams,
  agentId: string,
): Prisma.FsboLeadWhereInput {
  const islemTipi = searchParams.get("islemTipi");
  const kategori = searchParams.get("kategori");
  const il = searchParams.get("il");
  const ilce = searchParams.get("ilce");
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");

  const where: Prisma.FsboLeadWhereInput = {
    agentId,
    isDiscarded: false,
    promotedDealId: null,
  };

  if (islemTipi) where.islemTipi = islemTipi;
  if (kategori) where.kategori = kategori;
  if (il) where.il = il;
  if (ilce) where.ilce = ilce;

  const min = priceMin ? Number(priceMin.replace(/\D/g, "")) : null;
  const max = priceMax ? Number(priceMax.replace(/\D/g, "")) : null;

  if (min || max) {
    where.price = {
      ...(min ? { gte: min } : {}),
      ...(max ? { lte: max } : {}),
    };
  }

  return where;
}

export async function POST(request: Request) {
  try {
    const agent = await requireCurrentAgent();
    const { searchParams } = new URL(request.url);
    const { leads: syncedLeads, stats, message } = await runFsboScraperSync();

    const dbLeads = await prisma.fsboLead.findMany({
      where: buildLeadWhere(searchParams, agent.id),
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const leads = dbLeads.map(serializeFsboLead);

    return NextResponse.json({
      success: syncedLeads.length > 0 || leads.length > 0,
      synced: syncedLeads.length,
      leads,
      stats,
      message,
    });
  } catch (error) {
    console.error("[POST /api/fsbo-leads/sync]", error);

    if (error instanceof Error && error.message.includes("Oturum")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "FSBO senkronizasyonu başarısız." },
      { status: 500 },
    );
  }
}
