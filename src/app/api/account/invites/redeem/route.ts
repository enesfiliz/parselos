import { NextResponse } from "next/server";
import { z } from "zod";

import { redeemInviteForAgent } from "@/lib/account/team-service";
import { requireCurrentAgent } from "@/lib/auth/agent";

const redeemSchema = z.object({
  code: z.string().trim().min(4).max(20),
});

export async function POST(request: Request) {
  try {
    const agent = await requireCurrentAgent();
    const { code } = redeemSchema.parse(await request.json());

    const result = await redeemInviteForAgent(agent, code);

    return NextResponse.json({
      agent: result.agent,
      tenant: result.tenant,
      message: `${result.tenant.name} ofisine başarıyla katıldınız.`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz davet kodu." }, { status: 400 });
    }
    const message =
      error instanceof Error ? error.message : "Davet kodu kullanılamadı.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
