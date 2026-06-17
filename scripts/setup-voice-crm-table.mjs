import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });
config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "supabase", "migrations");

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

const migrationFiles = readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql") && name.includes("voice_crm"))
  .sort();

if (migrationFiles.length === 0) {
  console.error("✗ voice_crm migration dosyası bulunamadı.");
  process.exit(1);
}

try {
  for (const file of migrationFiles) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await pool.query(sql);
    console.log(`✓ ${file} uygulandı (veya zaten vardı).`);
  }
  console.log("  Sesli CRM sayfasını yenileyin: /sesli-crm");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("✗ Migration başarısız:", message);
  console.error(
    "\nAlternatif: Supabase Dashboard → SQL Editor → supabase/migrations/ içindeki voice_crm dosyalarını sırayla çalıştırın.",
  );
  process.exit(1);
} finally {
  await pool.end();
}
