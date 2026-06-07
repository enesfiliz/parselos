/** PM2 — CommonJS (Hostinger / eski Node uyumluluğu) */
module.exports = {
  apps: [
    {
      name: "parselos",
      script: "scripts/start-production.mjs",
      interpreter: "node",
      cwd: __dirname,
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
