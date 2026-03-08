import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 4200,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 2100,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Three.js core vs three-globe for better caching (Globe only loads on About)
          if (id.includes("three-globe")) return "vendor-globe";
          if (id.includes("node_modules/three/")) return "vendor-three";
          if (id.includes("three") && !id.includes("three-globe")) return "vendor-three";
          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("react-router")
          ) {
            return "vendor-react";
          }
          if (
            id.includes("framer-motion") ||
            id.includes("motion") ||
            id.includes("gsap")
          ) {
            return "vendor-animation";
          }
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("@microsoft/clarity")) return "vendor-clarity";
        },
      },
    },
  },
});
