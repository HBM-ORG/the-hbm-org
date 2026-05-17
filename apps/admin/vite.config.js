import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_BASE || env.BASE_URL || "";

  return {
    resolve: {
      /** Shared `lib/` imports resolve deps from cwd, not repo root node_modules */
      alias: {
        luxon: path.resolve(__dirname, "./node_modules/luxon"),
      },
    },
    plugins: [react(), tailwindcss()],
    server: {
      port: 4300,
      proxy: proxyTarget
        ? {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
            },
            "/assets": {
              target: proxyTarget,
              changeOrigin: true,
            },
          }
        : undefined,
    },
    build: {
      target: "es2020",
      chunkSizeWarningLimit: 2100,
    },
  };
});
