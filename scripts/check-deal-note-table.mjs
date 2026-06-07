import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import dotenv from "dotenv";

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
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const pool = new Pool({
  connectionString: normalizeConnectionString(url),
  ssl: url.includes("supabase") ? { rejectUnauthorized: false } : undefined,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const count = await prisma.dealNote.count();
  console.log("OK: DealNote table exists, count =", count);
} catch (error) {
  console.error("FAIL:", error.message);
  if (error.meta) console.error("meta:", error.meta);
  process.exit(1);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
