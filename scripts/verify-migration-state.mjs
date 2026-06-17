import { config } from "dotenv";
import pg from "pg";

config({ path: ".env" });
config({ path: ".env.local", override: true });

function dbIdentity(connectionString) {
  const url = new URL(connectionString);
  const ref = url.username.includes(".")
    ? url.username.split(".")[1]
    : "unknown";
  return {
    host: url.hostname,
    port: url.port,
    database: url.pathname.replace(/^\//, ""),
    projectRef: ref,
  };
}

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const identity = dbIdentity(connectionString);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
let supabaseRef = "missing";
try {
  supabaseRef = new URL(supabaseUrl).hostname.split(".")[0];
} catch {
  // ignore
}

console.log("PRISMA_IDENTITY", JSON.stringify(identity));
console.log("SUPABASE_PROJECT_REF", supabaseRef);
console.log(
  "SUPABASE_MATCHES_PRISMA",
  supabaseRef !== "missing" && supabaseRef === identity.projectRef,
);

function normalizeConnectionString(connectionString) {
  const isSupabase =
    connectionString.includes("supabase.com") ||
    connectionString.includes("supabase.co");
  if (!isSupabase) return connectionString;
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

const pool = new pg.Pool({
  connectionString: normalizeConnectionString(connectionString),
  ssl:
    connectionString.includes("supabase.com") ||
    connectionString.includes("supabase.co")
      ? { rejectUnauthorized: false }
      : undefined,
  max: 1,
});

try {
  const migrations = await pool.query(`
    SELECT migration_name, finished_at
    FROM _prisma_migrations
    ORDER BY finished_at DESC NULLS LAST
    LIMIT 20
  `);
  console.log("APPLIED_MIGRATIONS");
  for (const row of migrations.rows) {
    console.log(`${row.migration_name}|${row.finished_at ?? "pending"}`);
  }

  const tables = await pool.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'AgentNotification',
        'AssignmentAudit',
        'VoiceCrmAppliedAction',
        'voice_crm_logs'
      )
    ORDER BY tablename
  `);
  console.log("TABLES", tables.rows.map((r) => r.tablename).join(",") || "none");

  const voiceCols = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'voice_crm_logs'
      AND column_name IN (
        'updated_at', 'status', 'client_id', 'applied_action',
        'idempotency_key', 'transcript'
      )
    ORDER BY column_name
  `);
  console.log(
    "VOICE_CRM_LOGS_COLUMNS",
    voiceCols.rows.map((r) => r.column_name).join(",") || "none",
  );

  const voiceIndexes = await pool.query(`
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'voice_crm_logs'
    ORDER BY indexname
  `);
  console.log(
    "VOICE_CRM_LOGS_INDEXES",
    voiceIndexes.rows.map((r) => r.indexname).join(",") || "none",
  );
} finally {
  await pool.end();
}
