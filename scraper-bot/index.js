import "dotenv/config";
import { readFile } from "node:fs/promises";
import cron from "node-cron";

import { runScrapeJob } from "./scraper.js";

const DEFAULT_TARGETS_PATH = "./targets.json";

async function loadTargets() {
  const path = process.env.TARGETS_PATH?.trim() || DEFAULT_TARGETS_PATH;
  const raw = await readFile(path, "utf8");
  const targets = JSON.parse(raw);

  if (!Array.isArray(targets) || targets.length === 0) {
    throw new Error(`${path} geçerli bir hedef listesi içermiyor.`);
  }

  return targets.filter(
    (item) => item?.searchUrl && item?.region && item?.il && item?.ilce,
  );
}

async function executeJob() {
  const startedAt = new Date().toISOString();
  console.log(`[scraper-bot] Tarama başladı — ${startedAt}`);

  try {
    const targets = await loadTargets();
    console.log(`[scraper-bot] ${targets.length} hedef yüklendi.`);
    const result = await runScrapeJob(targets);
    const api = result.apiResult ?? {};
    console.log(
      `[scraper-bot] Tarama tamamlandı — ayıklanan: ${result.listings.length}, DB inserted: ${api.inserted ?? 0}, updated: ${api.updated ?? 0}`,
    );
    return result;
  } catch (error) {
    console.error("[scraper-bot] Tarama başarısız:", error);
    throw error;
  }
}

const schedule = process.env.CRON_SCHEDULE?.trim() || "0 8 * * *";
const timezone = process.env.CRON_TIMEZONE?.trim() || "Europe/Istanbul";

if (!cron.validate(schedule)) {
  throw new Error(`Geçersiz CRON_SCHEDULE ifadesi: ${schedule}`);
}

console.log(`[scraper-bot] Zamanlayıcı aktif: "${schedule}" (${timezone})`);

cron.schedule(
  schedule,
  () => {
    void executeJob();
  },
  { timezone },
);

const runNow = process.argv.includes("--run-now");

if (runNow) {
  executeJob()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else if (process.env.RUN_ON_START === "1") {
  void executeJob();
}
