import { NextResponse } from "next/server";
import { z } from "zod";

import { buildInvitePreview } from "@/lib/account/invite-accept";
import { requireCurrentAgent } from "@/lib/auth/agent";

const querySchema = z.object({
  code: z.string().trim().min(4).max(20),
});

export async function GET(request: Request) {
  try {
    const agent = await requireCurrentAgent();
    const { searchParams } = new URL(request.url);
    const { code } = querySchema.parse({ code: searchParams.get("code") ?? "" });
    const preview = await buildInvitePreview(code, agent);
    return NextResponse.json({ preview });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz davet kodu." }, { status: 400 });
    }
    console.error("[GET /api/account/invites/preview]", error);
    return NextResponse.json({ error: "Davet bilgisi alınamadı." }, { status: 500 });
  }
}
