import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildIdPath = path.join(rootDir, ".next", "BUILD_ID");

function resolvePort() {
  const raw =
    process.env.PORT ??
    process.env.APP_PORT ??
    process.env.SERVER_PORT ??
    "3000";
  const port = Number.parseInt(String(raw).trim(), 10);
  return Number.isFinite(port) && port > 0 ? port : 3000;
}

const port = resolvePort();
const hostname = process.env.HOSTNAME ?? "0.0.0.0";

if (!existsSync(buildIdPath)) {
  console.error(
    "[start] .next/BUILD_ID bulunamadı. Önce build alın:\n" +
      "  npm run build\n" +
      "  veya Hostinger'da: npm run build:hostinger",
  );
  process.exit(1);
}

const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");

if (!existsSync(nextBin)) {
  console.error("[start] next binary bulunamadı. npm install çalıştırın.");
  process.exit(1);
}

console.log(`[start] ParselOS production`);
console.log(`[start] cwd=${rootDir}`);
console.log(`[start] NODE_ENV=${process.env.NODE_ENV ?? "undefined"}`);
console.log(`[start] PORT=${port} (raw=${process.env.PORT ?? "unset"})`);
console.log(`[start] listen http://${hostname}:${port}`);

const child = spawn(
  process.execPath,
  [nextBin, "start", "--hostname", hostname, "--port", String(port)],
  {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`[start] Process killed: ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
