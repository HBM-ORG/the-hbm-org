import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_BASE || env.BASE_URL || "";

  return {
    plugins: [react(), tailwindcss()],
    publicDir: "./public",
    server: {
      port: 4200,
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
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("three-globe")) return "vendor-globe";
            if (id.includes("node_modules/three/")) return "vendor-three";
            if (id.includes("three") && !id.includes("three-globe")) return "vendor-three";
            if (
              id.includes("react")
              || id.includes("react-dom")
              || id.includes("react-router")
            ) {
              return "vendor-react";
            }
            if (
              id.includes("framer-motion")
              || id.includes("motion")
              || id.includes("gsap")
            ) {
              return "vendor-animation";
            }
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("@microsoft/clarity")) return "vendor-clarity";
          },
        },
      },
    },
  };
});
