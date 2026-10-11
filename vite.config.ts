import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "EBD Inteligente",
        short_name: "EBD",
        description: "Gestão de presenças da Escola Bíblica Dominical",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "portrait",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        navigateFallbackDenylist: [/^\/api/],
        // ✅ Aumenta o limite de precache pra 4 MB (resolve o erro do Netlify)
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          // React + ReactDOM em um chunk separado
          "react-vendor": ["react", "react-dom", "react-router-dom"],

          // Clerk (autenticação)
          "clerk-vendor": ["@clerk/react"],

          // Supabase
          "supabase-vendor": ["@supabase/supabase-js"],

          // Gráficos
          "charts-vendor": ["recharts"],

          // PDF
          "pdf-vendor": ["@react-pdf/renderer"],

          // Ícones (lucide)
          "icons-vendor": ["lucide-react"],

          // Datas
          "dates-vendor": ["date-fns"],

          // Estado global
          "state-vendor": ["zustand"],
        },
      },
    },
  },
});