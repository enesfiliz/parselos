import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { mapTtbsResultToLicenseStatus } from "@/lib/account/license-verification";
import { syncAgentProfileToClerk } from "@/lib/account/sync-profile-metadata";
import { verifyLicenseWithTtbs } from "@/lib/account/ttbs-client";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";
import { prisma } from "@/lib/prisma";

const licenseSchema = z.object({
  licenseNumber: z.string().trim().min(5).max(20),
  businessName: z.string().trim().min(2).max(160).optional(),
  city: z.string().trim().min(2).max(80).optional(),
});

export async function POST(request: Request) {
  try {
    const agent = await requireCurrentAgent();
    const { tenant } = await getOrCreateTenantForAgent(agent.id);
    const body = licenseSchema.parse(await request.json());

    const ttbsResult = await verifyLicenseWithTtbs({
      licenseNumber: body.licenseNumber,
      businessName: body.businessName ?? tenant.name,
      city: body.city ?? tenant.city ?? agent.city,
    });

    const mapped = mapTtbsResultToLicenseStatus(ttbsResult);
    const now = new Date();

    const updatedAgent = await prisma.agent.update({
      where: { id: agent.id },
      data: {
        licenseNumber: body.licenseNumber.trim().toUpperCase(),
        licenseStatus: mapped.status,
        licenseSubmittedAt: now,
        licenseVerifiedAt: mapped.status === "VERIFIED" ? now : null,
        licenseRejectReason: mapped.rejectReason ?? null,
        licenseRegistryMeta: mapped.registryMeta as Prisma.InputJsonValue,
      },
    });

    await syncAgentProfileToClerk(agent.clerkUserId, updatedAgent, tenant);

    const message = ttbsResult.ok
      ? ttbsResult.message
      : ttbsResult.ok === false
        ? ttbsResult.message
        : "İşlem tamamlandı.";

    return NextResponse.json({
      agent: {
        licenseNumber: updatedAgent.licenseNumber,
        licenseStatus: updatedAgent.licenseStatus,
        licenseVerifiedAt: updatedAgent.licenseVerifiedAt,
        licenseRejectReason: updatedAgent.licenseRejectReason,
        licenseRegistryMeta: updatedAgent.licenseRegistryMeta,
      },
      message,
      officialVerifyUrl:
        ttbsResult.ok === false ? ttbsResult.officialUrl : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz yetki bilgileri." }, { status: 400 });
    }
    console.error("[POST /api/account/license]", error);
    return NextResponse.json({ error: "Doğrulama başarısız." }, { status: 500 });
  }
}
