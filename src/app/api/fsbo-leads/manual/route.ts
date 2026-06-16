import { NextResponse } from "next/server";
import { z } from "zod";

import { requireCurrentAgent } from "@/lib/auth/agent";
import { getTenantPlanForClerkUser } from "@/lib/billing/tenant";
import {
  createManualFsboLeadForAgent,
  listActiveFsboLeadsForAgent,
} from "@/lib/fsbo/manual-fsbo-lead";
import { FSBO_PRODUCT_DISCLAIMER } from "@/lib/fsbo/fsbo-tracking";

const manualSchema = z.object({
  title: z.string().min(4),
  location: z.string().min(2),
  price: z.union([z.string(), z.number()]),
  notes: z.string().optional(),
  sourceUrl: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  trackingStatus: z
    .enum(["watching", "contacted", "follow_up", "negotiating", "closed"])
    .default("watching"),
  nextFollowUpAt: z.string().optional(),
  metrekare: z.union([z.string(), z.number()]).optional(),
});

export async function POST(request: Request) {
  try {
    const agent = await requireCurrentAgent();
    const body = manualSchema.parse(await request.json());
    const { planType } = await getTenantPlanForClerkUser(agent.clerkUserId);

    await createManualFsboLeadForAgent(agent.id, planType, body);
    const leads = await listActiveFsboLeadsForAgent(agent.id);

    return NextResponse.json({
      success: true,
      leads,
      productNote: FSBO_PRODUCT_DISCLAIMER,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : "Kayıt oluşturulamadı.";
    const status = message.includes("Ücretsiz planda") ? 403 : 500;
    console.error("[POST /api/fsbo-leads/manual]", error);
    return NextResponse.json({ error: message }, { status });
  }
}
