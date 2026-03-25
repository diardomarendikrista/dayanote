import { defineConfig } from "vite";
import dns from "dns";
import react from "@vitejs/plugin-react";
import jsconfigPaths from "vite-jsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  plugins: [
    react(),
    jsconfigPaths(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] },
      manifest: {
        name: 'DayaNote', short_name: 'DayaNote', theme_color: '#ffffff', display: "standalone",
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: { host: "0.0.0.0", port: 3000, open: true },
  resolve: { alias: { "./runtimeConfig": "./runtimeConfig.browser" } },
  // Optimized for Vite 8
  optimizeDeps: {
    include: ["process"]
  },
});
