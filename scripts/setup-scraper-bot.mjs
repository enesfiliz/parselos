#!/usr/bin/env node
/**
 * scraper-bot ilk kurulum: .env kopyala + npm install
 * Kullanım: npm run fsbo:bot:setup
 */
import { copyFile, access, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const botDir = path.join(root, "scraper-bot");
const envPath = path.join(botDir, ".env");
const envExample = path.join(botDir, ".env.example");
const logsDir = path.join(botDir, "logs");

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit", shell: true });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} çıkış kodu ${code}`));
    });
  });
}

async function main() {
  if (!(await exists(envPath))) {
    await copyFile(envExample, envPath);
    console.log("✓ scraper-bot/.env oluşturuldu (.env.example kopyası)");
    console.log("  → BOT_SECRET_KEY ve PARSELOS_API_URL değerlerini kontrol edin.");
  } else {
    console.log("• scraper-bot/.env zaten var, atlandı.");
  }

  await mkdir(logsDir, { recursive: true });
  console.log("→ scraper-bot bağımlılıkları yükleniyor…");
  await run("npm", ["install"], botDir);
  console.log("\nHazır. Test: npm run fsbo:bot:once");
  console.log("VPS daemon: cd scraper-bot && pm2 start ecosystem.config.cjs");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
