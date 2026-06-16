/**
 * Dev/test only — Broker Ofis (PREMIUM) planına test hesabı yükseltme.
 *
 * Zorunlu: ALLOW_TEST_BROKER_UPGRADE=1
 *
 * Çalıştırma:
 *   ALLOW_TEST_BROKER_UPGRADE=1 node --env-file=.env.local --import tsx scripts/upgrade-test-account-to-broker.ts
 *   ALLOW_TEST_BROKER_UPGRADE=1 node --env-file=.env.local --import tsx scripts/upgrade-test-account-to-broker.ts enesfiliz7@gmail.com
 *   ALLOW_TEST_BROKER_UPGRADE=1 node --env-file=.env.local --import tsx scripts/upgrade-test-account-to-broker.ts --agentId <uuid>
 *   ALLOW_TEST_BROKER_UPGRADE=1 node --env-file=.env.local --import tsx scripts/upgrade-test-account-to-broker.ts --clerkUserId user_xxx
 */
import "dotenv/config";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  type Agent,
  type Tenant,
  type TenantOrganizationType,
  type TenantPlanType,
  type TenantStatus,
} from "@prisma/client";

import {
  AGENT_ROLE_LABELS,
  LICENSE_STATUS_LABELS,
  ORGANIZATION_TYPE_LABELS,
  PLAN_LABELS,
} from "../src/lib/account/labels";
import { memberRoleLabel } from "../src/lib/account/permissions";
import { createPgPool } from "../src/lib/pg-pool";

const DEFAULT_EMAIL = "enesfiliz7@gmail.com";
const TARGET_PLAN: TenantPlanType = "PREMIUM";
const TARGET_STATUS: TenantStatus = "ACTIVE";
const TARGET_ORG: TenantOrganizationType = "BROKERLIK";

const SAFE_DB_HOSTS = [
  "localhost",
  "127.0.0.1",
  "::1",
  "host.docker.internal",
] as const;

const DANGEROUS_DB_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /production/i, label: "production" },
  { pattern: /(^|[^a-z])prod([^a-z]|$)/i, label: "prod" },
  { pattern: /vercel/i, label: "vercel" },
];

type AgentSnapshot = Pick<
  Agent,
  | "id"
  | "email"
  | "clerkUserId"
  | "roleType"
  | "tenantId"
  | "tenantMemberRole"
  | "firstName"
  | "lastName"
  | "professionalTitle"
  | "phone"
  | "licenseNumber"
  | "licenseStatus"
  | "city"
>;

type TenantSnapshot = Pick<
  Tenant,
  | "id"
  | "name"
  | "planType"
  | "status"
  | "organizationType"
  | "ownerAgentId"
  | "iyzicoCustomerReference"
  | "iyzicoSubscriptionReference"
  | "iyzicoPricingPlanReference"
> | null;

type ScriptArgs = {
  email?: string;
  agentId?: string;
  clerkUserId?: string;
};

type VerificationSnapshot = {
  agent: {
    email: string | null;
    id: string;
    clerkUserId: string;
    roleType: string;
    tenantMemberRole: string;
    tenantId: string | null;
  };
  tenant: {
    id: string;
    planType: string;
    status: string;
    organizationType: string;
    ownerAgentId: string | null;
    iyzicoCustomerReference: string | null;
    iyzicoSubscriptionReference: string | null;
    iyzicoPricingPlanReference: string | null;
  } | null;
};

function parseScriptArgs(argv: string[]): ScriptArgs {
  const args: ScriptArgs = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === "--agentId") {
      args.agentId = argv[i + 1]?.trim();
      i += 1;
      continue;
    }
    if (token.startsWith("--agentId=")) {
      args.agentId = token.slice("--agentId=".length).trim();
      continue;
    }
    if (token === "--clerkUserId") {
      args.clerkUserId = argv[i + 1]?.trim();
      i += 1;
      continue;
    }
    if (token.startsWith("--clerkUserId=")) {
      args.clerkUserId = token.slice("--clerkUserId=".length).trim();
      continue;
    }
    if (!token.startsWith("--")) {
      args.email = token.trim().toLowerCase();
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

function isSafeLocalDatabaseHost(host: string): boolean {
  const normalized = host.toLowerCase();
  return (
    SAFE_DB_HOSTS.includes(normalized as (typeof SAFE_DB_HOSTS)[number]) ||
    normalized.endsWith(".localhost")
  );
}

function assertSafetyGuards(databaseUrl: string) {
  if (process.env.ALLOW_TEST_BROKER_UPGRADE !== "1") {
    throw new Error(
      "Script devre dışı. Bilinçli test için ALLOW_TEST_BROKER_UPGRADE=1 ayarlayın.",
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Bu script production ortamında çalışmaz. NODE_ENV=production engellendi.",
    );
  }

  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV === "production") {
    throw new Error(
      "Bu script Vercel production runtime'da çalışmaz.",
    );
  }

  const clerkSecret = process.env.CLERK_SECRET_KEY?.trim() ?? "";
  if (clerkSecret.startsWith("sk_live_")) {
    throw new Error(
      "CLERK_SECRET_KEY live anahtar görünüyor. Yerel/test secret (sk_test_) kullanın.",
    );
  }

  if (!databaseUrl) {
    throw new Error("DATABASE_URL tanımlı değil (.env.local kontrol edin).");
  }

  const host = parseDatabaseHost(databaseUrl);
  const urlLower = databaseUrl.toLowerCase();

  if (isSafeLocalDatabaseHost(host)) {
    return;
  }

  const matched = DANGEROUS_DB_PATTERNS.filter(({ pattern }) => pattern.test(urlLower));
  if (matched.length > 0) {
    const labels = matched.map((item) => item.label).join(", ");
    throw new Error(
      `DATABASE_URL güvenlik kontrolünden geçmedi (host: ${host}).\n` +
        `Eşleşen pattern(ler): ${labels}\n` +
        "Yerel Postgres (localhost / 127.0.0.1) kullanın veya .env.local'in dev DB'ye baktığını doğrulayın.",
    );
  }

  if (/supabase\.co/i.test(urlLower)) {
    console.warn(
      "⚠ Uzak Supabase host algılandı. Dev/test project olduğunu doğrulayın; production DB ise scripti durdurun.",
    );
    console.warn("");
  }
}

function createScriptPrisma() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  assertSafetyGuards(databaseUrl ?? "");

  const host = parseDatabaseHost(databaseUrl!);
  console.log(`DB hedefi: ${host}`);
  console.log("");

  const pool = createPgPool(databaseUrl!);
  return {
    prisma: new PrismaClient({ adapter: new PrismaPg(pool) }),
    pool,
  };
}

function tenantDisplayName(agent: AgentSnapshot) {
  const fullName = [agent.firstName, agent.lastName].filter(Boolean).join(" ").trim();
  if (fullName) return `${fullName} Brokerlık`;
  if (agent.email) return `${agent.email.split("@")[0]} Brokerlık`;
  return "ParselOS Brokerlık";
}

function toVerificationSnapshot(
  agent: AgentSnapshot,
  tenant: TenantSnapshot,
): VerificationSnapshot {
  return {
    agent: {
      email: agent.email,
      id: agent.id,
      clerkUserId: agent.clerkUserId,
      roleType: agent.roleType,
      tenantMemberRole: agent.tenantMemberRole,
      tenantId: agent.tenantId,
    },
    tenant: tenant
      ? {
          id: tenant.id,
          planType: tenant.planType,
          status: tenant.status,
          organizationType: tenant.organizationType,
          ownerAgentId: tenant.ownerAgentId,
          iyzicoCustomerReference: tenant.iyzicoCustomerReference,
          iyzicoSubscriptionReference: tenant.iyzicoSubscriptionReference,
          iyzicoPricingPlanReference: tenant.iyzicoPricingPlanReference,
        }
      : null,
  };
}

function printVerificationBlock(title: string, snapshot: VerificationSnapshot) {
  console.log(`── ${title} ──`);
  console.log(JSON.stringify(snapshot, null, 2));
  console.log("");
}

function buildClerkPublicMetadata(
  agent: AgentSnapshot,
  tenant: Tenant,
): Record<string, unknown> {
  const syncedAt = new Date().toISOString();

  return {
    roleType: agent.roleType,
    roleLabel: AGENT_ROLE_LABELS[agent.roleType],
    professionalTitle: agent.professionalTitle ?? null,
    phone: agent.phone ?? null,
    licenseNumber: agent.licenseNumber ?? null,
    licenseStatus: agent.licenseStatus,
    licenseLabel: LICENSE_STATUS_LABELS[agent.licenseStatus],
    tenantMemberRole: agent.tenantMemberRole,
    tenantMemberLabel: memberRoleLabel(agent.tenantMemberRole),
    city: agent.city ?? null,
    organizationName: tenant.name,
    organizationType: tenant.organizationType,
    organizationLabel: ORGANIZATION_TYPE_LABELS[tenant.organizationType],
    planType: tenant.planType,
    planLabel: PLAN_LABELS[tenant.planType],
    tenantStatus: tenant.status,
    profileSyncedAt: syncedAt,
    planSyncedAt: syncedAt,
  };
}

async function syncAgentProfileToClerk(
  clerkUserId: string,
  agent: AgentSnapshot,
  tenant: Tenant,
): Promise<{ ok: boolean; error?: string }> {
  const secret = process.env.CLERK_SECRET_KEY?.trim();
  if (!secret) {
    return {
      ok: false,
      error: "CLERK_SECRET_KEY tanımlı değil — Clerk publicMetadata güncellenemedi.",
    };
  }

  const response = await fetch(
    `https://api.clerk.com/v1/users/${clerkUserId}/metadata`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: buildClerkPublicMetadata(agent, tenant),
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    return {
      ok: false,
      error: `Clerk API ${response.status}: ${body.slice(0, 300)}`,
    };
  }

  return { ok: true };
}

async function resolveTargetAgent(
  prisma: PrismaClient,
  args: ScriptArgs,
) {
  if (args.agentId) {
    const agent = await prisma.agent.findUnique({
      where: { id: args.agentId },
      include: { tenant: true },
    });
    if (!agent) {
      throw new Error(`Agent bulunamadı (--agentId): ${args.agentId}`);
    }
    return agent;
  }

  if (args.clerkUserId) {
    const agent = await prisma.agent.findUnique({
      where: { clerkUserId: args.clerkUserId },
      include: { tenant: true },
    });
    if (!agent) {
      throw new Error(`Agent bulunamadı (--clerkUserId): ${args.clerkUserId}`);
    }
    return agent;
  }

  const targetEmail = (args.email || DEFAULT_EMAIL).toLowerCase();
  const matches = await prisma.agent.findMany({
    where: { email: { equals: targetEmail, mode: "insensitive" } },
    include: { tenant: true },
    orderBy: { olusturulmaTarihi: "asc" },
  });

  if (matches.length === 0) {
    throw new Error(
      `Agent bulunamadı (email): ${targetEmail}\n` +
        "Önce bu e-posta ile uygulamaya en az bir kez giriş yapın (Clerk → Agent kaydı oluşur).",
    );
  }

  if (matches.length > 1) {
    console.error(`Birden fazla Agent kaydı bulundu (${targetEmail}):`);
    for (const match of matches) {
      console.error(
        `  - id=${match.id} clerkUserId=${match.clerkUserId} tenantId=${match.tenantId ?? "(yok)"}`,
      );
    }
    throw new Error(
      "E-posta benzersiz değil. Hiçbir kayıt değiştirilmedi.\n" +
        "Tekrar çalıştırın: --agentId <uuid> veya --clerkUserId user_xxx",
    );
  }

  return matches[0]!;
}

function assertIyzicoFieldsUnchanged(
  before: VerificationSnapshot,
  after: VerificationSnapshot,
) {
  if (!before.tenant || !after.tenant) return;

  const refs = [
    "iyzicoCustomerReference",
    "iyzicoSubscriptionReference",
    "iyzicoPricingPlanReference",
  ] as const;

  for (const key of refs) {
    if (before.tenant[key] !== after.tenant[key]) {
      throw new Error(
        `Beklenmeyen iyzico alanı değişti: ${key} (${before.tenant[key]} → ${after.tenant[key]})`,
      );
    }
  }
}

async function main() {
  const args = parseScriptArgs(process.argv.slice(2));

  console.log("═".repeat(60));
  console.log("ParselOS — Broker Ofis test hesabı yükseltme (dev-only)");
  console.log("═".repeat(60));
  if (args.agentId) {
    console.log(`Hedef: --agentId ${args.agentId}`);
  } else if (args.clerkUserId) {
    console.log(`Hedef: --clerkUserId ${args.clerkUserId}`);
  } else {
    console.log(`Hedef e-posta: ${args.email || DEFAULT_EMAIL}`);
  }
  console.log(`Hedef plan: ${TARGET_PLAN} (UI: Ofis / Broker Ofis)`);

  const { prisma, pool } = createScriptPrisma();

  try {
    const agent = await resolveTargetAgent(prisma, args);

    const before = toVerificationSnapshot(agent, agent.tenant);
    printVerificationBlock("BEFORE", before);

    let tenant = agent.tenant;

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: tenantDisplayName(agent),
          planType: TARGET_PLAN,
          status: TARGET_STATUS,
          organizationType: TARGET_ORG,
          ownerAgentId: agent.id,
        },
      });

      await prisma.agent.update({
        where: { id: agent.id },
        data: {
          tenantId: tenant.id,
          roleType: "BROKER",
          tenantMemberRole: "OWNER",
        },
      });
    } else {
      tenant = await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          planType: TARGET_PLAN,
          status: TARGET_STATUS,
          organizationType: TARGET_ORG,
          ownerAgentId: agent.id,
        },
      });

      await prisma.agent.update({
        where: { id: agent.id },
        data: {
          tenantId: tenant.id,
          roleType: "BROKER",
          tenantMemberRole: "OWNER",
        },
      });
    }

    const updatedAgent = await prisma.agent.findUniqueOrThrow({
      where: { id: agent.id },
      include: { tenant: true },
    });

    if (!updatedAgent.tenant) {
      throw new Error("Tenant güncellemesi sonrası tenant bulunamadı.");
    }

    const tenantMembers = await prisma.agent.findMany({
      where: { tenantId: updatedAgent.tenant.id },
    });

    console.log("Clerk metadata senkronu (sync-profile-metadata shape)...");
    const syncFailures: string[] = [];
    let synced = 0;

    for (const member of tenantMembers) {
      const result = await syncAgentProfileToClerk(
        member.clerkUserId,
        member,
        updatedAgent.tenant,
      );

      if (result.ok) {
        synced += 1;
        console.log(`  ✓ ${member.email ?? member.id} (${member.clerkUserId})`);
      } else {
        const message = `${member.email ?? member.id}: ${result.error}`;
        syncFailures.push(message);
        console.error(`  ✗ ${message}`);
      }
    }

    console.log(`  → ${synced}/${tenantMembers.length} üye güncellendi`);
    console.log("");

    const after = toVerificationSnapshot(updatedAgent, updatedAgent.tenant);
    printVerificationBlock("AFTER", after);

    assertIyzicoFieldsUnchanged(before, after);

    console.log("Doğrulama:");
    console.log(`  ✓ Tenant.ownerAgentId = Agent.id → ${after.tenant?.ownerAgentId === after.agent.id}`);
    console.log(
      `  ✓ iyzicoCustomerReference değişmedi → ${after.tenant?.iyzicoCustomerReference === before.tenant?.iyzicoCustomerReference}`,
    );
    console.log(
      `  ✓ iyzicoSubscriptionReference değişmedi → ${after.tenant?.iyzicoSubscriptionReference === before.tenant?.iyzicoSubscriptionReference}`,
    );
    console.log(
      `  ✓ iyzicoPricingPlanReference değişmedi → ${after.tenant?.iyzicoPricingPlanReference === before.tenant?.iyzicoPricingPlanReference}`,
    );
    console.log("");
    console.log("Özet:");
    console.log(`  ✓ Plan: ${before.tenant?.planType ?? "(yok)"} → ${after.tenant?.planType}`);
    console.log(
      `  ✓ Rol: ${before.agent.roleType} → ${after.agent.roleType}, üyelik: ${before.agent.tenantMemberRole} → ${after.agent.tenantMemberRole}`,
    );
    console.log(
      `  ✓ Organizasyon: ${before.tenant?.organizationType ?? "(yok)"} → ${after.tenant?.organizationType}`,
    );
    console.log("");

    const targetSyncFailed = syncFailures.some((line) =>
      line.startsWith(updatedAgent.email ?? updatedAgent.id),
    );

    if (syncFailures.length > 0) {
      console.error("UYARI: Clerk metadata senkronu kısmen veya tamamen başarısız.");
      console.error("DB güncellendi; tarayıcıda plan/rol görünmüyorsa çıkış yapıp tekrar giriş yapın.");
      console.error("Clerk hataları:");
      for (const failure of syncFailures) {
        console.error(`  - ${failure}`);
      }

      if (targetSyncFailed || synced === 0) {
        process.exitCode = 1;
      }
    } else {
      console.log("Test için: çıkış yapıp tekrar giriş yapın veya sayfayı yenileyin.");
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("");
  console.error("HATA:", error instanceof Error ? error.message : error);
  process.exit(1);
});
