import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reports = await prisma.appraisalReport.findMany({
      orderBy: { olusturulmaTarihi: "desc" },
      select: {
        id: true,
        baslik: true,
        ada: true,
        parsel: true,
        m2: true,
        jsonVerisi: true,
        clientId: true,
        olusturulmaTarihi: true,
      },
    });

    return NextResponse.json({ data: reports });
  } catch (error) {
    console.error("[GET /api/appraisals]", error);

    const details = error instanceof Error ? error.message : "Bilinmeyen hata";

    return NextResponse.json(
      { error: "Arşiv raporları yüklenemedi", details },
      { status: 500 },
    );
  }
}

interface CreateAppraisalBody {
  baslik?: string;
  ada?: string;
  parsel?: string;
  m2?: string;
  jsonVerisi?: unknown;
  clientId?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateAppraisalBody;

    const baslik = body.baslik?.trim();
    const ada = body.ada?.trim();
    const parsel = body.parsel?.trim();
    const m2 = body.m2?.trim();

    if (!baslik || !ada || !parsel || !m2) {
      return NextResponse.json(
        { error: "baslik, ada, parsel ve m2 alanları zorunludur." },
        { status: 400 },
      );
    }

    if (body.jsonVerisi === undefined || body.jsonVerisi === null) {
      return NextResponse.json(
        { error: "jsonVerisi alanı zorunludur." },
        { status: 400 },
      );
    }

    const jsonVerisi =
      typeof body.jsonVerisi === "string"
        ? body.jsonVerisi
        : JSON.stringify(body.jsonVerisi);

    if (body.clientId?.trim()) {
      const client = await prisma.client.findUnique({
        where: { id: body.clientId.trim() },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Belirtilen müşteri bulunamadı." },
          { status: 404 },
        );
      }
    }

    const report = await prisma.appraisalReport.create({
      data: {
        baslik,
        ada,
        parsel,
        m2,
        jsonVerisi,
        clientId: body.clientId?.trim() || null,
      },
    });

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/appraisals]", error);

    return NextResponse.json(
      { error: "Ekspertiz raporu kaydedilirken bir hata oluştu." },
      { status: 500 },
    );
  }
}
