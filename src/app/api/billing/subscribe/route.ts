import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { requireCurrentAgent } from "@/lib/auth/agent";
import type { BillablePlan } from "@/lib/billing/plans";
import { createSubscriptionForAgent } from "@/lib/iyzico/subscription";

type SubscribeBody = {
  plan?: BillablePlan;
  gsmNumber?: string;
  identityNumber?: string;
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    const agent = await requireCurrentAgent();
    const body = (await req.json()) as SubscribeBody;
    const plan = body.plan;

    if (plan !== "PRO" && plan !== "PREMIUM") {
      return NextResponse.json(
        { error: "Geçerli bir paket seçin (PRO veya PREMIUM)." },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/billing/callback`;

    const checkout = await createSubscriptionForAgent(agent.id, plan, callbackUrl, {
      gsmNumber: body.gsmNumber,
      identityNumber: body.identityNumber,
    });

    return NextResponse.json({
      data: {
        tenantId: checkout.tenantId,
        plan: checkout.plan,
        token: checkout.token,
        checkoutFormContent: checkout.checkoutFormContent,
      },
    });
  } catch (error) {
    console.error("[POST /api/billing/subscribe]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Abonelik başlatılırken bir hata oluştu.",
      },
      { status: 500 },
    );
  }
}
