module.exports = {
  apps: [
    {
      name: "hbm-server",
      script: "./node_modules/.bin/tsx",
      args: "./apps/server/src/web.ts",
      env: {
        NODE_ENV: "production",
        PORT: 3001
      },
      watch: false,
      max_memory_restart: "500M",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
