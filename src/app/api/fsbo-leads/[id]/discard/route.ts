import { NextResponse } from "next/server";

import { serializeFsboLead } from "@/lib/fsbo/serialize-lead";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const lead = await prisma.fsboLead.update({
      where: { id },
      data: { isDiscarded: true, isRead: true },
    });

    return NextResponse.json({
      success: true,
      data: serializeFsboLead(lead),
    });
  } catch (error) {
    console.error("[POST /api/fsbo-leads/discard]", error);
    return NextResponse.json(
      { error: "İlan çöpe atılamadı." },
      { status: 500 },
    );
  }
}
