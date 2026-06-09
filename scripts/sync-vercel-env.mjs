/**
 * .env.local + .env.production.local → Vercel Production env sync
 * Kullanım: node scripts/sync-vercel-env.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const KEYS = [
  "DATABASE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SIGNING_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_MAPBOX_TOKEN",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_CLERK_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_SIGN_UP_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL",
  "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL",
  "BOT_SECRET_KEY",
  "CRON_SECRET",
  "IYZICO_API_KEY",
  "IYZICO_SECRET_KEY",
  "IYZICO_BASE_URL",
  "IYZICO_PRO_PLAN_REFERENCE",
  "IYZICO_PREMIUM_PLAN_REFERENCE",
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, "utf8");
  const env = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
}

const env = {
  ...parseEnvFile(path.join(rootDir, ".env.local")),
  ...parseEnvFile(path.join(rootDir, ".env.production.local")),
};

const CLERK_DEFAULTS = {
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/dashboard",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/dashboard",
  NEXT_PUBLIC_APP_URL: "https://parselos.com",
};

for (const [key, value] of Object.entries(CLERK_DEFAULTS)) {
  if (!env[key]?.trim()) env[key] = value;
}

// Production Clerk keys .env.production.local'den gelmeli
if (env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_")) {
  console.error(
    "✗ Vercel için production Clerk key gerekli (.env.production.local).",
  );
  process.exit(1);
}

if (env.DATABASE_URL?.includes("pooler.supabase.com")) {
  let url = env.DATABASE_URL.replace(":5432/", ":6543/");
  if (!url.includes("pgbouncer=true")) {
    url += url.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
  }
  if (!url.includes("connection_limit")) {
    url += "&connection_limit=1";
  }
  env.DATABASE_URL = url;
}

let synced = 0;
let skipped = 0;

for (const key of KEYS) {
  const value = env[key]?.trim();
  if (!value) {
    console.warn(`⚠ Atlandı (boş): ${key}`);
    skipped++;
    continue;
  }

  console.log(`→ ${key}`);

  spawnSync("npx", ["vercel", "env", "rm", key, "production", "--yes"], {
    cwd: rootDir,
    stdio: "ignore",
    shell: true,
  });

  const add = spawnSync(
    "npx",
    ["vercel", "env", "add", key, "production", "--force"],
    {
      cwd: rootDir,
      input: value,
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
    },
  );

  if (add.status !== 0) {
    console.error(`✗ ${key} eklenemedi`);
    process.exit(1);
  }

  synced++;
}

console.log(`\n✓ ${synced} değişken Vercel Production'a aktarıldı (${skipped} atlandı).`);
if (!env.CLERK_WEBHOOK_SIGNING_SECRET) {
  console.log(
    "\n⚠ CLERK_WEBHOOK_SIGNING_SECRET eksik — Clerk Dashboard → Webhooks →\n" +
      "  URL: https://parselos.com/api/webhooks/clerk\n" +
      "  Events: user.created, user.updated, session.created\n" +
      "  Sonra whsec_... değerini .env.production.local'e ekleyip scripti tekrar çalıştır.",
  );
}
