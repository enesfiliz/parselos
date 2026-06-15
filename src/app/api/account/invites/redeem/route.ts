import { NextResponse } from "next/server";
import { z } from "zod";

import { InviteRedeemError } from "@/lib/account/invite-accept";
import { redeemInviteForAgent } from "@/lib/account/team-service";
import { requireCurrentAgent } from "@/lib/auth/agent";

const redeemSchema = z.object({
  code: z.string().trim().min(4).max(20),
});

function statusForInviteError(code: InviteRedeemError["code"]) {
  switch (code) {
    case "NOT_FOUND":
    case "EXPIRED":
    case "CANCELLED":
    case "USED":
    case "NOT_BROKER_OFFICE":
      return 404;
    case "ALREADY_MEMBER":
      return 409;
    case "BLOCKED":
      return 403;
  }
}

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
    if (error instanceof InviteRedeemError) {
      return NextResponse.json(
        { error: error.message },
        { status: statusForInviteError(error.code) },
      );
    }
    const message =
      error instanceof Error ? error.message : "Davet kodu kullanılamadı.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
