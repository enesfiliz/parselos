import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { createPgPool } from "@/lib/pg-pool";

/** Şema değişince bu değeri artırın — dev önbelleğini sıfırlar. */
const PRISMA_CLIENT_REVISION = "agent-clerk-v5";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: ReturnType<typeof createPgPool> | undefined;
  databaseUrl: string | undefined;
  prismaRevision: string | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  if (
    globalForPrisma.pgPool &&
    globalForPrisma.databaseUrl !== databaseUrl
  ) {
    void globalForPrisma.pgPool.end();
    globalForPrisma.pgPool = undefined;
    globalForPrisma.prisma = undefined;
  }

  globalForPrisma.databaseUrl = databaseUrl;

  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = createPgPool(databaseUrl);
  }

  return new PrismaClient({
    adapter: new PrismaPg(globalForPrisma.pgPool),
  });
}

function resetPrismaCache() {
  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect();
  }
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaRevision = undefined;
}

function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  const revisionMatches =
    globalForPrisma.prismaRevision === PRISMA_CLIENT_REVISION;

  if (cached && revisionMatches) {
    return cached;
  }

  resetPrismaCache();

  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  globalForPrisma.prismaRevision = PRISMA_CLIENT_REVISION;
  return client;
}

function missingDelegateMessage(model: string) {
  return `prisma.${model} tanımsız. Terminalde: npx prisma generate && npm run dev`;
}

/**
 * Her erişimde güncel client döner — HMR / generate sonrası eski delegate
 * (ör. prisma.agent) undefined kalmasın diye proxy kullanılır.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);

    if (
      typeof prop === "string" &&
      ["agent", "dealNote", "deal", "client", "fsboLead"].includes(prop) &&
      value === undefined
    ) {
      throw new Error(missingDelegateMessage(prop));
    }

    return typeof value === "function" ? value.bind(client) : value;
  },
});
