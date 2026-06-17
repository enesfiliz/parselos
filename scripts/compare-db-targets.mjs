import { readFileSync, unlinkSync } from "node:fs";
import { config } from "dotenv";

config({ path: ".env.local" });

function projectRefFromDatabaseUrl(raw) {
  if (!raw) return "missing";
  try {
    const url = new URL(raw.trim());
    return url.username.includes(".")
      ? url.username.split(".")[1]
      : url.hostname;
  } catch {
    return "invalid";
  }
}

let vercelRef = "missing";
try {
  const raw = readFileSync(".env.vercel-check", "utf8");
  const match = raw.match(/^DATABASE_URL=(.*)$/m);
  if (match) {
    let value = match[1].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vercelRef = projectRefFromDatabaseUrl(value);
  } else {
    console.log("VERCEL_ENV_HAS_DATABASE_URL", false);
  }
} catch {
  console.log("VERCEL_ENV_FILE", "absent");
}

const localRef = projectRefFromDatabaseUrl(process.env.DATABASE_URL);
console.log("LOCAL_PROJECT_REF", localRef);
console.log("VERCEL_PROD_PROJECT_REF", vercelRef);
console.log(
  "SAME_DATABASE",
  localRef === vercelRef && localRef !== "missing" && localRef !== "invalid",
);

try {
  unlinkSync(".env.vercel-check");
} catch {
  // ignore cleanup failure
}
