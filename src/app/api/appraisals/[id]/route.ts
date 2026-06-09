import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existing = await prisma.appraisalReport.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Rapor bulunamadı." }, { status: 404 });
    }

    await prisma.appraisalReport.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/appraisals/[id]]", error);
    return NextResponse.json(
      { error: "Rapor silinemedi." },
      { status: 500 },
    );
  }
}
