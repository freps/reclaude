import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: { overlay: true },
    port: 3000,
    proxy: {
      "/api": {
        changeOrigin: true,
        target: "http://localhost:3001",
      },
    },
  },
});
