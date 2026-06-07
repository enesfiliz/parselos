import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

config({ path: ".env.local" });

function isSupabaseHost(connectionString) {
  return (
    connectionString.includes("supabase.com") ||
    connectionString.includes("supabase.co")
  );
}

function normalizeConnectionString(connectionString) {
  if (!isSupabaseHost(connectionString)) return connectionString;
  const url = new URL(connectionString);
  url.searchParams.delete("sslmode");
  const query = url.searchParams.toString();
  url.search = query ? `?${query}` : "";
  return url.toString();
}

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const pool = new Pool({
  connectionString: normalizeConnectionString(connectionString),
  ssl: isSupabaseHost(connectionString) ? { rejectUnauthorized: false } : undefined,
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const [clients, reports, listings] = await Promise.all([
    prisma.client.count(),
    prisma.appraisalReport.count(),
    prisma.listingText.count(),
  ]);
  console.log("✓ Dashboard queries OK", { clients, reports, listings });
} catch (error) {
  console.error("✗ Dashboard query failed:", error.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
