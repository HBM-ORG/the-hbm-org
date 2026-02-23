import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 4200,
  },
  build: {
    // Increase warning threshold to 1MB (Globe.js is large by design)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking: split large vendor libraries into separate files
        // This improves caching and parallel loading for users
        manualChunks(id) {
          // Three.js + Globe = separate chunk (large 3D library)
          if (id.includes('three') || id.includes('three-globe')) {
            return 'vendor-three';
          }
          // React ecosystem
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor-react';
          }
          // Animation libraries
          if (id.includes('framer-motion') || id.includes('motion') || id.includes('gsap')) {
            return 'vendor-animation';
          }
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
        }
      }
    }
  }
})
