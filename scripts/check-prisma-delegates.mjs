import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

function normalizeConnectionString(connectionString) {
  if (!connectionString.includes("supabase")) return connectionString;
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    const query = url.searchParams.toString();
    url.search = query ? `?${query}` : "";
    return url.toString();
  } catch {
    return connectionString;
  }
}

const url = process.env.DATABASE_URL?.trim();
const pool = new Pool({
  connectionString: normalizeConnectionString(url),
  ssl: url.includes("supabase") ? { rejectUnauthorized: false } : undefined,
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const checks = {
  agent_upsert: typeof prisma.agent?.upsert,
  dealNote_findMany: typeof prisma.dealNote?.findMany,
  fsboLead_findMany: typeof prisma.fsboLead?.findMany,
  fsboWatchRegion_findMany: typeof prisma.fsboWatchRegion?.findMany,
};

console.log(checks);
console.log("agent keys:", prisma.agent ? Object.keys(prisma.agent).slice(0, 8) : "missing");

await prisma.$disconnect();
await pool.end();
