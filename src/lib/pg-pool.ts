import { Pool, type PoolConfig } from "pg";

function isSupabaseHost(connectionString: string) {
  return (
    connectionString.includes("supabase.com") ||
    connectionString.includes("supabase.co")
  );
}

/** pg v8+ treats sslmode=require as verify-full; strip it and use pool.ssl instead */
export function normalizeConnectionString(connectionString: string) {
  if (!isSupabaseHost(connectionString)) {
    return connectionString;
  }

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

export function createPgPool(connectionString: string) {
  const normalized = normalizeConnectionString(connectionString);
  const isServerless = Boolean(process.env.VERCEL);

  const config: PoolConfig = {
    connectionString: normalized,
    // Vercel serverless: her instance tek bağlantı (Supabase transaction pooler ile)
    max: isServerless ? 1 : 5,
    idleTimeoutMillis: isServerless ? 5_000 : 20_000,
    connectionTimeoutMillis: isServerless ? 5_000 : 10_000,
    allowExitOnIdle: isServerless,
  };

  if (isSupabaseHost(connectionString)) {
    config.ssl = { rejectUnauthorized: false };
  }

  return new Pool(config);
}

export function getDatabaseConnectionHint(connectionString: string) {
  try {
    const url = new URL(connectionString);
    const hints: string[] = [];

    if (isSupabaseHost(connectionString)) {
      if (url.port === "6543" && !url.searchParams.has("pgbouncer")) {
        hints.push(
          "Transaction pooler (6543) için ?pgbouncer=true ekleyin veya session pooler (5432) kullanın.",
        );
      }

      if (!url.username.includes(".")) {
        hints.push(
          "Pooler kullanıcı adı postgres.[PROJECT_REF] formatında olmalı.",
        );
      }

      hints.push(
        "sslmode=require URL'de kalabilir; uygulama bağlantıda otomatik SSL yapılandırır.",
      );
    }

    if (url.password && /[@#/:?&=%]/.test(decodeURIComponent(url.password))) {
      hints.push(
        "Şifrenizde özel karakter varsa URL encode edin (ör. @ → %40).",
      );
    }

    return hints;
  } catch {
    return ["DATABASE_URL geçerli bir PostgreSQL URI değil."];
  }
}
