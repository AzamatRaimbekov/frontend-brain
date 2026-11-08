// node:http helpers: JSON responses, a size-limited JSON body reader, CORS for the Figma widget
// (its requests come from a "null" origin) and static files of the built client.
import { createReadStream, existsSync, statSync } from "node:fs"
import type { IncomingMessage, ServerResponse } from "node:http"
import { extname, join, normalize, sep } from "node:path"

export class HttpError extends Error {
  constructor(public status: number, message: string, public body: Record<string, unknown> = {}) {
    super(message)
  }
}

export const MAX_BODY = 256 * 1024

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, If-Match, X-Write-Key",
  "Access-Control-Expose-Headers": "ETag",
  "Access-Control-Max-Age": "600",
}

export function send(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  const text = typeof body === "string" ? body : `${JSON.stringify(body, null, 2)}\n`
  res.writeHead(status, {
    ...CORS,
    "Content-Type": typeof body === "string" ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  })
  res.end(text)
}

export async function readJson(req: IncomingMessage): Promise<unknown> {
  const type = String(req.headers["content-type"] ?? "")
  if (!/^application\/json\b/i.test(type)) throw new HttpError(415, "Нужен Content-Type: application/json")
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    size += (chunk as Buffer).length
    if (size > MAX_BODY) throw new HttpError(413, `Тело запроса больше ${MAX_BODY / 1024} КБ`)
    chunks.push(chunk as Buffer)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "null")
  } catch {
    throw new HttpError(400, "Тело запроса — не JSON")
  }
}

/** If-Match: "3", W/"3" or 3 -> 3; missing -> null; garbage -> NaN. */
export function ifMatch(req: IncomingMessage): number | null {
  const raw = req.headers["if-match"]
  if (raw === undefined) return null
  const m = /^(?:W\/)?"?(\d+)"?$/.exec(String(raw).trim())
  return m ? Number(m[1]) : NaN
}

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".map": "application/json",
}

/** Serves dist/ (the built client); unknown paths get index.html (the client routes by hash). */
export function serveStatic(res: ServerResponse, dir: string, urlPath: string) {
  if (!existsSync(join(dir, "index.html"))) {
    send(res, 404, "Клиент не собран: npm run build в apps/ds-configurator")
    return
  }
  const rel = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, "")
  let file = join(dir, rel)
  if (!file.startsWith(dir + sep) && file !== dir) throw new HttpError(400, "Плохой путь")
  if (!existsSync(file) || !statSync(file).isFile()) file = join(dir, "index.html")
  const immutable = file.includes(`${sep}assets${sep}`)
  res.writeHead(200, {
    "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
    "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "no-cache",
    "X-Content-Type-Options": "nosniff",
  })
  createReadStream(file).pipe(res)
}
