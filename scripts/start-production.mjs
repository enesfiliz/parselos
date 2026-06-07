import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOSTNAME ?? "0.0.0.0";

if (!Number.isFinite(port) || port <= 0) {
  console.error(`[start] Invalid PORT: ${process.env.PORT}`);
  process.exit(1);
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");

console.log(`[start] ParselOS → http://${hostname}:${port}`);

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
