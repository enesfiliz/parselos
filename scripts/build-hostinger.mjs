import { spawnSync } from "node:child_process";

process.env.HOSTINGER_BUILD = "1";

const steps = [
  ["npx", ["prisma", "generate"]],
  ["npx", ["next", "build"]],
  ["node", ["scripts/prepare-standalone.mjs"]],
];

for (const [cmd, args] of steps) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
