import { Pool } from "pg";

function isSupabaseHost(connectionString) {
  return (
    connectionString.includes("supabase.com") ||
    connectionString.includes("supabase.co")
  );
}

function getDatabaseConnectionHint(connectionString) {
  try {
    const url = new URL(connectionString);
    const hints = [];

    if (isSupabaseHost(connectionString)) {
      if (url.port === "6543" && !url.searchParams.has("pgbouncer")) {
        hints.push(
          "Supabase transaction pooler (6543) kullanıyorsanız URL sonuna ?pgbouncer=true ekleyin veya session pooler (5432) tercih edin.",
        );
      }

      if (!url.username.includes(".")) {
        hints.push(
          "Pooler bağlantısında kullanıcı adı postgres.[PROJECT_REF] formatında olmalı.",
        );
      }
    }

    return hints;
  } catch {
    return ["DATABASE_URL geçerli bir PostgreSQL URI değil."];
  }
}

function normalizeConnectionString(connectionString) {
  if (!isSupabaseHost(connectionString)) return connectionString;
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

function createPgPool(connectionString) {
  const normalized = normalizeConnectionString(connectionString);
  const config = {
    connectionString: normalized,
    max: 1,
    connectionTimeoutMillis: 10_000,
  };

  if (isSupabaseHost(connectionString)) {
    config.ssl = { rejectUnauthorized: false };
  }

  return new Pool(config);
}

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.error("✗ DATABASE_URL tanımlı değil.");
  process.exit(1);
}

console.log("Parselos — veritabanı bağlantı testi\n");

for (const hint of getDatabaseConnectionHint(connectionString)) {
  console.warn(`⚠ ${hint}`);
}

const pool = createPgPool(connectionString);

try {
  await pool.query("SELECT 1 AS ok");
  console.log("✓ Veritabanı bağlantısı başarılı.");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`✗ Bağlantı başarısız: ${message}`);
  console.error(
    "\nSupabase → Database → Connection string (Session pooler, 5432) kullanın.",
  );
  console.error(
    "Şifreyi sıfırladıktan sonra .env.local dosyasını güncelleyip dev sunucusunu yeniden başlatın.",
  );
  process.exit(1);
} finally {
  await pool.end();
}
