import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { syncAgentProfileToClerk } from "@/lib/account/sync-profile-metadata";
import {
  assertAllowedOrganizationTypeChange,
  assertAllowedRoleTypeChange,
  ProfileUpgradeBlockedError,
} from "@/lib/account/profile-guards";
import { canEditTenantProfile, canManageTeam } from "@/lib/account/permissions";
import { requireCurrentAgent } from "@/lib/auth/agent";
import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";
import { prisma } from "@/lib/prisma";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  roleType: z.enum(["DANISMAN", "KURULUS", "BROKER"]).optional(),
  professionalTitle: z.string().trim().max(120).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  licenseNumber: z.string().trim().max(60).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  tenantName: z.string().trim().min(2).max(160).optional(),
  organizationType: z
    .enum(["BIREYSEL", "OFIS", "KURULUS", "BROKERLIK"])
    .optional(),
  taxNumber: z.string().trim().max(20).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  tenantPhone: z.string().trim().max(30).optional().nullable(),
  tenantCity: z.string().trim().max(80).optional().nullable(),
  website: z.string().trim().max(200).optional().nullable(),
});

export async function GET() {
  try {
    const agent = await requireCurrentAgent();
    const { tenant } = await getOrCreateTenantForAgent(agent.id);

    return NextResponse.json({
      agent: {
        id: agent.id,
        email: agent.email,
        firstName: agent.firstName,
        lastName: agent.lastName,
        imageUrl: agent.imageUrl,
        roleType: agent.roleType,
        professionalTitle: agent.professionalTitle,
        phone: agent.phone,
        licenseNumber: agent.licenseNumber,
        licenseStatus: agent.licenseStatus,
        licenseRejectReason: agent.licenseRejectReason,
        licenseVerifiedAt: agent.licenseVerifiedAt,
        tenantMemberRole: agent.tenantMemberRole,
        city: agent.city,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        planType: tenant.planType,
        status: tenant.status,
        organizationType: tenant.organizationType,
        taxNumber: tenant.taxNumber,
        address: tenant.address,
        phone: tenant.phone,
        city: tenant.city,
        website: tenant.website,
      },
    });
  } catch (error) {
    console.error("[GET /api/account/profile]", error);
    return NextResponse.json(
      { error: "Profil bilgileri alınamadı." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
    }

    const agent = await requireCurrentAgent();
    const { tenant } = await getOrCreateTenantForAgent(agent.id);
    const body = updateProfileSchema.parse(await request.json());

    assertAllowedRoleTypeChange(
      agent.email,
      tenant,
      body.roleType,
      agent.roleType,
    );
    assertAllowedOrganizationTypeChange(
      agent.email,
      tenant,
      body.organizationType,
      tenant.organizationType,
    );

    const teamSize = await prisma.agent.count({ where: { tenantId: tenant.id } });
    const roleType = body.roleType ?? agent.roleType;

    if (
      body.roleType &&
      body.roleType !== agent.roleType &&
      agent.tenantMemberRole !== "OWNER" &&
      teamSize > 1
    ) {
      return NextResponse.json(
        { error: "Ofis üyesi olarak rolünüzü değiştiremezsiniz." },
        { status: 403 },
      );
    }

    const hasTenantFields =
      body.tenantName !== undefined ||
      body.organizationType !== undefined ||
      body.taxNumber !== undefined ||
      body.address !== undefined ||
      body.tenantPhone !== undefined ||
      body.tenantCity !== undefined ||
      body.website !== undefined;

    if (hasTenantFields && !canEditTenantProfile(agent, tenant)) {
      return NextResponse.json(
        { error: "Kurumsal bilgileri yalnızca ofis yöneticisi düzenleyebilir." },
        { status: 403 },
      );
    }

    const organizationType =
      body.organizationType ??
      (body.roleType && canManageTeam(agent, tenant)
        ? body.roleType === "BROKER"
          ? "BROKERLIK"
          : body.roleType === "KURULUS"
            ? "KURULUS"
            : "BIREYSEL"
        : tenant.organizationType);

    const licenseChanged =
      body.licenseNumber !== undefined &&
      body.licenseNumber !== agent.licenseNumber;

    const updatedAgent = await prisma.agent.update({
      where: { id: agent.id },
      data: {
        firstName: body.firstName ?? undefined,
        lastName: body.lastName ?? undefined,
        roleType,
        professionalTitle: body.professionalTitle,
        phone: body.phone,
        licenseNumber: body.licenseNumber,
        ...(licenseChanged
          ? {
              licenseStatus: "NONE" as const,
              licenseVerifiedAt: null,
              licenseRejectReason: null,
              licenseSubmittedAt: null,
            }
          : {}),
        city: body.city,
      },
    });

    const tenantUpdate: Parameters<typeof prisma.tenant.update>[0]["data"] = {
      name: body.tenantName ?? undefined,
      organizationType,
      taxNumber: body.taxNumber,
      address: body.address,
      phone: body.tenantPhone,
      city: body.tenantCity,
      website: body.website,
    };

    if (
      body.roleType === "BROKER" &&
      canManageTeam(agent, tenant) &&
      tenant.ownerAgentId !== agent.id
    ) {
      tenantUpdate.ownerAgentId = agent.id;
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: tenantUpdate,
    });

    if (body.firstName !== undefined || body.lastName !== undefined) {
      const client = await clerkClient();
      await client.users.updateUser(userId, {
        firstName: updatedAgent.firstName ?? undefined,
        lastName: updatedAgent.lastName ?? undefined,
      });
    }

    await syncAgentProfileToClerk(userId, updatedAgent, updatedTenant);

    return NextResponse.json({
      agent: updatedAgent,
      tenant: updatedTenant,
    });
  } catch (error) {
    if (error instanceof ProfileUpgradeBlockedError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz profil verisi.", details: error.flatten() },
        { status: 400 },
      );
    }

    console.error("[PATCH /api/account/profile]", error);
    return NextResponse.json(
      { error: "Profil güncellenemedi." },
      { status: 500 },
    );
  }
}
