import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Client-only bundle for the offline Android app. The website keeps using vite.config.ts. */
export default defineConfig({
  root: fileURLToPath(new URL("./src/android", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "./",
  build: {
    outDir: fileURLToPath(new URL("./dist-android", import.meta.url)),
    emptyOutDir: true,
  },
});
