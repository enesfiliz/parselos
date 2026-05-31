import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

interface UpdateClientBody {
  adSoyad?: string;
  telefon?: string;
  email?: string;
  notlar?: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as UpdateClientBody;

    const adSoyad = body.adSoyad?.trim();

    if (!adSoyad) {
      return NextResponse.json(
        { error: "Müşteri adı soyadı zorunludur." },
        { status: 400 },
      );
    }

    const existing = await prisma.client.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        adSoyad,
        telefon: body.telefon?.trim() || null,
        email: body.email?.trim() || null,
        notlar: body.notlar?.trim() || null,
      },
    });

    return NextResponse.json({ data: client });
  } catch (error) {
    console.error("[PATCH /api/clients/[id]]", error);

    return NextResponse.json(
      { error: "Müşteri güncellenirken bir hata oluştu." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.client.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    await prisma.client.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/clients/[id]]", error);

    return NextResponse.json(
      { error: "Müşteri silinirken bir hata oluştu." },
      { status: 500 },
    );
  }
}
