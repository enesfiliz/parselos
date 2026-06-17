import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });
config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(
  __dirname,
  "..",
  "prisma",
  "migrations",
  "20260617200000_voice_crm_applied_action",
  "migration.sql",
);

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
  console.error("✗ DATABASE_URL tanımlı değil (.env.local)");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: normalizeConnectionString(connectionString),
  ssl: isSupabaseHost(connectionString) ? { rejectUnauthorized: false } : undefined,
});

const sql = readFileSync(sqlPath, "utf8");

try {
  await pool.query(sql);
  console.log("✓ VoiceCrmAppliedAction tablosu oluşturuldu (veya zaten vardı).");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("✗ Migration başarısız:", message);
  process.exit(1);
} finally {
  await pool.end();
}
