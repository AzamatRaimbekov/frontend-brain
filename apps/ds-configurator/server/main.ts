// Entry of the design-system site: API + built client on one port (default 8797).
// Usage: npm run build && npm start   (env: PORT, HOST, DATA_DIR, FRONTEND_PACK_DIR)
import { createServer } from "node:http"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { createApp } from "./app"

// Bundled to dist-server/main.js or run from server/: the app folder is one level up either way.
const APP = join(dirname(fileURLToPath(import.meta.url)), "..")
const port = Number(process.env.PORT ?? 8797)
const host = process.env.HOST ?? "127.0.0.1"

const handle = await createApp({
  dataDir: resolve(process.env.DATA_DIR ?? join(APP, "data")),
  frontendPackDir: resolve(process.env.FRONTEND_PACK_DIR ?? join(APP, "..", "..", "plugins", "frontend-pack")),
  staticDir: join(APP, "dist"),
})

createServer(handle).listen(port, host, () => {
  console.log(`ds-configurator: http://${host === "0.0.0.0" ? "localhost" : host}:${port}  (API /api, registry /r/<project>.json)`)
})
