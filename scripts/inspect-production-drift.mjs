import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

function normalizeConnectionString(connectionString) {
  const url = new URL(connectionString.trim());
  url.searchParams.delete("sslmode");
  const query = url.searchParams.toString();
  url.search = query ? `?${query}` : "";
  return url.toString();
}

const pool = new pg.Pool({
  connectionString: normalizeConnectionString(process.env.DATABASE_URL),
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const migrations = await pool.query(
  "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at",
);
console.log("MIGRATION_ROWS", migrations.rows.length);
for (const row of migrations.rows) {
  console.log(row.migration_name, row.finished_at ? "applied" : "pending");
}

const checks = [
  ["VoiceCrmAppliedAction", `SELECT to_regclass('public."VoiceCrmAppliedAction"') AS v`],
  ["AgentNotification", `SELECT to_regclass('public."AgentNotification"') AS v`],
  ["AssignmentAudit", `SELECT to_regclass('public."AssignmentAudit"') AS v`],
  ["DealNote", `SELECT to_regclass('public."DealNote"') AS v`],
  ["TenantInvite", `SELECT to_regclass('public."TenantInvite"') AS v`],
];

for (const [label, sql] of checks) {
  const result = await pool.query(sql);
  console.log(label, result.rows[0]?.v ? "EXISTS" : "MISSING");
}

const agentCols = await pool.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'Agent'
    AND column_name IN ('roleType', 'tenantMemberRole')
`);
console.log("Agent_cols", agentCols.rows.map((r) => r.column_name).join(",") || "none");

const fsboCols = await pool.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'FsboLead'
    AND column_name IN ('images', 'islemTipi', 'kategori', 'listingNo')
`);
console.log("FsboLead_cols", fsboCols.rows.map((r) => r.column_name).join(",") || "none");

const dealCol = await pool.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'Deal' AND column_name = 'fsboLeadId'
`);
console.log("Deal.fsboLeadId", dealCol.rows[0]?.column_name ? "EXISTS" : "MISSING");

await pool.end();
