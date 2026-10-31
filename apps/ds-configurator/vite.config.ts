/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 8796, strictPort: false },
  // One page with the upstream theme and font tables inlined; an internal tool, no code splitting.
  build: { chunkSizeWarningLimit: 700 },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
})
