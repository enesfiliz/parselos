/**
 * Hostinger hPanel — PM2 process manager
 * hPanel → Websites → Node.js → PM2 / Startup file: ecosystem.config.js
 */
export default {
  apps: [
    {
      name: "parselos",
      script: "npm",
      args: "run start",
      interpreter: "none",
      cwd: process.cwd(),
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1536M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
