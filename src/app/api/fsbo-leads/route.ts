import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { agentOwnershipFilter, requireCurrentAgent } from "@/lib/auth/agent";
import { DEFAULT_FSBO_REGIONS } from "@/lib/fsbo/fsbo-sync-targets";
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
  const region = searchParams.get("region");

  const where: Prisma.FsboLeadWhereInput = {
    ...agentOwnershipFilter(agentId),
    isRead: false,
    isDiscarded: false,
    promotedDealId: null,
  };

  if (region) where.region = region;
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

export async function GET(request: Request) {
  try {
    const agent = await requireCurrentAgent();
    const { searchParams } = new URL(request.url);

    const [regions, leads] = await Promise.all([
      prisma.fsboWatchRegion.findMany({ orderBy: { label: "asc" } }),
      prisma.fsboLead.findMany({
        where: buildLeadWhere(searchParams, agent.id),
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    return NextResponse.json({
      regions:
        regions.length > 0
          ? regions.map((item) => ({ id: item.id, label: item.label }))
          : DEFAULT_FSBO_REGIONS.map((label, index) => ({
              id: `region-default-${index}`,
              label,
            })),
      leads: leads.map(serializeFsboLead),
      useMock: false,
    });
  } catch (error) {
    console.error("[GET /api/fsbo-leads]", error);

    if (error instanceof Error && error.message.includes("Oturum")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "FSBO ilanları yüklenemedi." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireCurrentAgent();

    const body = (await request.json()) as { label?: string };
    const label = body.label?.trim();

    if (!label) {
      return NextResponse.json(
        { error: "Bölge adı zorunludur." },
        { status: 400 },
      );
    }

    const region = await prisma.fsboWatchRegion.upsert({
      where: { label },
      update: {},
      create: { label },
    });

    return NextResponse.json({
      data: { id: region.id, label: region.label },
    });
  } catch (error) {
    console.error("[POST /api/fsbo-leads]", error);

    if (error instanceof Error && error.message.includes("Oturum")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Bölge eklenemedi." },
      { status: 500 },
    );
  }
}
