/** PM2: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "parselos-scraper-bot",
      script: "index.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "800M",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
