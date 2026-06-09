import { NextResponse } from "next/server";
import { z } from "zod";

import { SAHIBINDEN_POLICY } from "@/lib/compliance/data-source-policy";
import {
  importListingItemsForAgent,
  listImportedLeadsForAgent,
} from "@/lib/fsbo/import-listing-urls";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { getTenantPlanForClerkUser } from "@/lib/billing/tenant";

const itemSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  price: z.union([z.string(), z.number()]).optional(),
  location: z.string().optional(),
  m2: z.union([z.string(), z.number()]).optional(),
  imageUrl: z.string().url().optional(),
});

const importSchema = z.object({
  items: z.array(itemSchema).min(1).max(20).optional(),
  urls: z.array(z.string().url()).min(1).max(20).optional(),
  addToPortfolio: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const agent = await requireCurrentAgent();
    const body = importSchema.parse(await request.json());

    const items =
      body.items ??
      body.urls?.map((url) => ({ url })) ??
      [];

    if (items.length === 0) {
      return NextResponse.json({ error: "URL listesi boş." }, { status: 400 });
    }

    const { planType } = await getTenantPlanForClerkUser(agent.clerkUserId);

    const { results, imported } = await importListingItemsForAgent(
      items,
      agent.id,
      planType,
      { addToPortfolio: body.addToPortfolio },
    );

    const leads = await listImportedLeadsForAgent(agent.id);

    return NextResponse.json({
      imported,
      failed: results.filter((r) => !r.success).length,
      results,
      leads,
      policyNote: SAHIBINDEN_POLICY.summary,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    const message =
      error instanceof Error ? error.message : "İçe aktarma başarısız.";
    const status = message.includes("Ücretsiz planda") ? 403 : 500;
    console.error("[POST /api/fsbo-leads/import]", error);
    return NextResponse.json({ error: message }, { status });
  }
}
