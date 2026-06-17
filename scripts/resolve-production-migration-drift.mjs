import { execFileSync } from "node:child_process";
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

const PENDING = [
  "20260608120000_fsbo_leads",
  "20260609120000_agent_tenant_profile",
  "20260609120000_fsbo_lead_media",
  "20260610120000_deal_notes",
  "20260610120000_tenant_invites_hierarchy",
  "20260611120000_deal_fsbo_lead_link",
  "20260617160000_agent_notifications",
  "20260617180000_assignment_audit",
  "20260617200000_voice_crm_applied_action",
];

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

const host = new URL(process.env.DATABASE_URL).hostname;
const ref = new URL(process.env.DATABASE_URL).username.split(".")[1] ?? "unknown";
if (ref === "ahjeqiipgjxsmdzwlbel") {
  console.error("Refusing to baseline staging project");
  process.exit(1);
}
if (!host.includes("ap-southeast-2")) {
  console.error("Refusing unexpected production host", host);
  process.exit(1);
}

console.log("TARGET_REF", ref);

for (const migration of PENDING) {
  execFileSync("npx", ["prisma", "migrate", "resolve", "--applied", migration], {
    stdio: "inherit",
    shell: true,
  });
  console.log("RESOLVED", migration);
}

const status = execFileSync("npx", ["prisma", "migrate", "status"], {
  encoding: "utf8",
  shell: true,
});
console.log(status);

await pool.end();
