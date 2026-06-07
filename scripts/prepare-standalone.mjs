import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standaloneDir = path.join(rootDir, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.warn("[standalone] .next/standalone yok, atlanıyor.");
  process.exit(0);
}

const copies = [
  [path.join(rootDir, ".next", "static"), path.join(standaloneDir, ".next", "static")],
  [path.join(rootDir, "public"), path.join(standaloneDir, "public")],
];

for (const [from, to] of copies) {
  if (!existsSync(from)) {
    console.warn(`[standalone] Kaynak yok: ${from}`);
    continue;
  }
  cpSync(from, to, { recursive: true });
  console.log(`[standalone] Kopyalandı → ${path.relative(rootDir, to)}`);
}
