import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Hostinger hPanel — PM2 process manager
 * hPanel → Websites → Node.js → PM2 / Startup file: ecosystem.config.js
 */
export default {
  apps: [
    {
      name: "parselos",
      script: "scripts/start-production.mjs",
      interpreter: "node",
      cwd: rootDir,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1200M",
      env: {
        NODE_ENV: "production",
        NODE_OPTIONS: "--max-old-space-size=1024",
      },
    },
  ],
};
