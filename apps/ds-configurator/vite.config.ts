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
  // npm run dev: the client on 8796, the API (npm start / npm run dev:server) on 8797.
  server: {
    port: 8796,
    strictPort: false,
    proxy: { "/api": "http://localhost:8797", "/r": "http://localhost:8797" },
  },
  // One page with the upstream theme and font tables inlined; an internal tool, no code splitting.
  build: { chunkSizeWarningLimit: 700 },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
})
