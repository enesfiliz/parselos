import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

interface CreateClientBody {
  adSoyad?: string;
  telefon?: string;
  email?: string;
  notlar?: string;
}

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { olusturulmaTarihi: "desc" },
    });

    return NextResponse.json({ data: clients });
  } catch (error) {
    console.error("[GET /api/clients]", error);

    return NextResponse.json(
      { error: "Müşteriler listelenirken bir hata oluştu." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateClientBody;

    const adSoyad = body.adSoyad?.trim();
    const telefon = body.telefon?.trim() || null;
    const email = body.email?.trim() || null;
    const notlar = body.notlar?.trim() || null;

    if (!adSoyad) {
      return NextResponse.json(
        { error: "Müşteri adı soyadı zorunludur." },
        { status: 400 },
      );
    }

    const client = await prisma.client.create({
      data: {
        adSoyad,
        telefon,
        email,
        notlar,
      },
    });

    return NextResponse.json({ data: client }, { status: 201 });
  } catch (error) {
    console.error("PRISMA KAYIT HATASI:", error);
    const details = error instanceof Error ? error.message : "Bilinmeyen hata";

    return NextResponse.json(
      { error: "Kayıt başarısız", details },
      { status: 500 },
    );
  }
}
