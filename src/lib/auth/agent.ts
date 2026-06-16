import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { getOrCreateTenantForAgent } from "@/lib/billing/tenant";
import { prisma } from "@/lib/prisma";

export type ClerkUserLike = {
  id: string;
  email_addresses?: Array<{ email_address: string }>;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
};

function primaryEmail(user: ClerkUserLike): string | null {
  return user.email_addresses?.[0]?.email_address?.trim() || null;
}

export async function upsertAgentFromClerk(user: ClerkUserLike) {
  const now = new Date();

  return prisma.agent.upsert({
    where: { clerkUserId: user.id },
    create: {
      clerkUserId: user.id,
      email: primaryEmail(user),
      firstName: user.first_name ?? null,
      lastName: user.last_name ?? null,
      imageUrl: user.image_url ?? null,
      roleType: "DANISMAN",
      tenantMemberRole: "MEMBER",
      lastActiveAt: now,
    },
    update: {
      email: primaryEmail(user),
      firstName: user.first_name ?? null,
      lastName: user.last_name ?? null,
      imageUrl: user.image_url ?? null,
      lastActiveAt: now,
    },
  });
}

export async function touchAgentActivity(clerkUserId: string) {
  return prisma.agent.updateMany({
    where: { clerkUserId },
    data: { lastActiveAt: new Date() },
  });
}

/**
 * Tüm agentId: null kayıtlarını verilen agent'a atar.
 * Yalnızca explicit migration/dev script'lerinden çağrılmalıdır —
 * signup, webhook veya ensureCurrentAgent akışında otomatik kullanılmaz.
 */
export async function assignOrphanRecordsToAgent(agentId: string) {
  await Promise.all([
    prisma.fsboLead.updateMany({
      where: { agentId: null },
      data: { agentId },
    }),
    prisma.deal.updateMany({
      where: { agentId: null },
      data: { agentId },
    }),
  ]);
}

export async function getAgentForClerkUserId(clerkUserId: string) {
  return prisma.agent.findUnique({
    where: { clerkUserId },
  });
}

export async function getMostRecentlyActiveAgent() {
  return prisma.agent.findFirst({
    orderBy: { lastActiveAt: "desc" },
  });
}

export async function ensureCurrentAgent() {
  const user = await currentUser();
  if (!user) return null;

  const clerkProfile = {
    id: user.id,
    email_addresses: user.emailAddresses.map((item) => ({
      email_address: item.emailAddress,
    })),
    first_name: user.firstName,
    last_name: user.lastName,
    image_url: user.imageUrl,
  };

  const agent = await upsertAgentFromClerk(clerkProfile);

  return agent;
}

export async function requireCurrentAgent() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Oturum açmanız gerekiyor.");
  }

  let agent = await getAgentForClerkUserId(userId);
  if (!agent) {
    agent = await ensureCurrentAgent();
  }

  if (!agent) {
    throw new Error("Danışman kaydı bulunamadı.");
  }

  await getOrCreateTenantForAgent(agent.id);

  return agent;
}

export function agentOwnershipFilter(agentId: string) {
  return { agentId };
}
