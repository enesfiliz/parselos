/**
 * Tek seferlik / operasyonel — kullanıcıyı FREE bireysel plana sıfırlar.
 *
 * Kullanım:
 *   ALLOW_FREE_PLAN_RESET=1 node --env-file=.env.local --import tsx scripts/reset-user-to-free-plan.ts --clerkUserId user_xxx
 *   ALLOW_FREE_PLAN_RESET=1 node --env-file=.env.local --import tsx scripts/reset-user-to-free-plan.ts --email user@example.com
 *
 * Production Clerk için CLERK_SECRET_KEY'i .env.production.local'den export edin.
 */
import "dotenv/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Agent, type Tenant } from "@prisma/client";

import {
  AGENT_ROLE_LABELS,
  LICENSE_STATUS_LABELS,
  ORGANIZATION_TYPE_LABELS,
  PLAN_LABELS,
} from "../src/lib/account/labels";
import { isBrokerOwnerEmail } from "../src/lib/account/broker-owner";
import { memberRoleLabel } from "../src/lib/account/permissions";
import {
  createDefaultFreeTenantForAgent,
  ensureSoloFreeTenantIntegrity,
  revertUnauthorizedBrokerProvisioning,
} from "../src/lib/account/tenant-provisioning";
import { createPgPool } from "../src/lib/pg-pool";

const DEFAULT_CLERK_USER_ID = "user_3Ews20GvGJ9cTjBnGVpb4HHr3IJ";

type Args = {
  clerkUserId?: string;
  email?: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--clerkUserId") {
      args.clerkUserId = argv[i + 1]?.trim();
      i += 1;
      continue;
    }
    if (token.startsWith("--clerkUserId=")) {
      args.clerkUserId = token.slice("--clerkUserId=".length).trim();
      continue;
    }
    if (token === "--email") {
      args.email = argv[i + 1]?.trim().toLowerCase();
      i += 1;
      continue;
    }
    if (token.startsWith("--email=")) {
      args.email = token.slice("--email=".length).trim().toLowerCase();
    }
  }
  return args;
}

function parseDatabaseHost(databaseUrl: string): string {
  try {
    return new URL(databaseUrl).hostname;
  } catch {
    return "(hostname çözümlenemedi)";
  }
}

function assertAllowed() {
  if (process.env.ALLOW_FREE_PLAN_RESET !== "1") {
    throw new Error("Güvenlik: ALLOW_FREE_PLAN_RESET=1 ile çalıştırın.");
  }

  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL tanımlı değil.");
  }

  if (!process.env.CLERK_SECRET_KEY?.trim()) {
    throw new Error("CLERK_SECRET_KEY tanımlı değil.");
  }

  const host = parseDatabaseHost(process.env.DATABASE_URL);
  console.log(`DB hedefi: ${host}`);
  if (process.env.NODE_ENV === "production") {
    console.warn("⚠ NODE_ENV=production — production veritabanı hedefleniyor.");
  }
}

async function syncClerk(
  clerkUserId: string,
  agent: {
    roleType: string;
    tenantMemberRole: string;
    professionalTitle: string | null;
    phone: string | null;
    licenseNumber: string | null;
    licenseStatus: string;
    city: string | null;
  },
  tenant: {
    name: string;
    organizationType: string;
    planType: string;
    status: string;
  } | null,
) {
  const secret = process.env.CLERK_SECRET_KEY!.trim();
  const response = await fetch(
    `https://api.clerk.com/v1/users/${clerkUserId}/metadata`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: {
          roleType: agent.roleType,
          roleLabel: AGENT_ROLE_LABELS[agent.roleType as keyof typeof AGENT_ROLE_LABELS],
          professionalTitle: agent.professionalTitle,
          phone: agent.phone,
          licenseNumber: agent.licenseNumber,
          licenseStatus: agent.licenseStatus,
          licenseLabel:
            LICENSE_STATUS_LABELS[
              agent.licenseStatus as keyof typeof LICENSE_STATUS_LABELS
            ],
          tenantMemberRole: agent.tenantMemberRole,
          tenantMemberLabel: memberRoleLabel(
            agent.tenantMemberRole as "OWNER" | "MANAGER" | "MEMBER",
            tenant
              ? {
                  planType: tenant.planType as "FREE" | "PRO" | "PREMIUM",
                  organizationType: tenant.organizationType as
                    | "BIREYSEL"
                    | "OFIS"
                    | "KURULUS"
                    | "BROKERLIK",
                }
              : null,
          ),
          city: agent.city,
          organizationName: tenant?.name ?? null,
          organizationType: tenant?.organizationType ?? null,
          organizationLabel: tenant
            ? ORGANIZATION_TYPE_LABELS[
                tenant.organizationType as keyof typeof ORGANIZATION_TYPE_LABELS
              ]
            : null,
          planType: tenant?.planType ?? "FREE",
          planLabel: tenant
            ? PLAN_LABELS[tenant.planType as keyof typeof PLAN_LABELS]
            : PLAN_LABELS.FREE,
          tenantStatus: tenant?.status ?? "ACTIVE",
          profileSyncedAt: new Date().toISOString(),
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Clerk metadata güncellenemedi (${response.status}): ${body.slice(0, 400)}`);
  }
}

function printSnapshot(label: string, agent: unknown, tenant: unknown) {
  console.log(`── ${label} ──`);
  console.log(JSON.stringify({ agent, tenant }, null, 2));
  console.log("");
}

async function main() {
  assertAllowed();

  const args = parseArgs(process.argv.slice(2));
  const clerkUserId = args.clerkUserId ?? DEFAULT_CLERK_USER_ID;
  const email = args.email;

  const pool = createPgPool(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const before = email
      ? await prisma.agent.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
          include: { tenant: true },
        })
      : await prisma.agent.findUnique({
          where: { clerkUserId },
          include: { tenant: true },
        });

    if (!before) {
      throw new Error("Agent bulunamadı.");
    }

    if (isBrokerOwnerEmail(before.email)) {
      throw new Error(
        `Broker owner allowlist hesabına dokunulmaz: ${before.email}`,
      );
    }

    printSnapshot("BEFORE", before, before.tenant);

    let agent: Agent = before;
    let tenant: Tenant | null = before.tenant;

    if (tenant) {
      const reverted = await revertUnauthorizedBrokerProvisioning(agent, tenant);
      const integrity = await ensureSoloFreeTenantIntegrity(
        reverted.agent,
        reverted.tenant,
      );
      agent = integrity.agent;
      tenant = integrity.tenant;
    } else {
      const provisioned = await createDefaultFreeTenantForAgent(agent);
      agent = provisioned.agent;
      tenant = provisioned.tenant;
    }

    try {
      await syncClerk(agent.clerkUserId, agent, tenant);
      console.log("✓ Clerk publicMetadata senkronize edildi.");
    } catch (clerkError) {
      console.warn("⚠ Clerk metadata güncellenemedi (DB düzeltmesi tamamlandı):");
      console.warn(clerkError);
    }

    printSnapshot("AFTER", agent, tenant);
    console.log("✓ FREE bireysel plan uygulandı.");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
