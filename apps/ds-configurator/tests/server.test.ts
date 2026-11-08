// The site API on a temp data folder: create, read, PUT with optimistic version (409), write key,
// Figma link, outputs (tokens.css from tokens-build, registry:base, figma.json) and validation.
import Ajv from "ajv"
import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { createServer, type Server } from "node:http"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import schema from "@/upstream/registry-item.schema.json"

import { createApp } from "../server/app"

const APP = join(__dirname, "..")
const FRONTEND_PACK = join(APP, "..", "..", "plugins", "frontend-pack")
let server: Server
let url = ""
let data = ""

beforeAll(async () => {
  data = mkdtempSync(join(tmpdir(), "ds-site-"))
  const handle = await createApp({ dataDir: data, frontendPackDir: FRONTEND_PACK, staticDir: join(data, "no-dist") })
  server = createServer(handle)
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r))
  const addr = server.address()
  url = `http://127.0.0.1:${typeof addr === "object" && addr ? addr.port : 0}`
})
afterAll(() => {
  server.close()
  rmSync(data, { recursive: true, force: true })
})

const api = async (path: string, init: RequestInit & { json?: unknown } = {}) => {
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) }
  if (init.json !== undefined) headers["Content-Type"] = "application/json"
  const res = await fetch(`${url}${path}`, { ...init, headers, body: init.json !== undefined ? JSON.stringify(init.json) : init.body })
  const text = await res.text()
  let body: any = text
  try { body = JSON.parse(text) } catch { /* css */ }
  return { status: res.status, body, headers: res.headers }
}

describe("site API", () => {
  let key = ""

  it("creates a project on the mbank base and returns the write key once", async () => {
    const r = await api("/api/projects", { method: "POST", json: { name: "Кредитный конвейер", id: "credit", brand: "bank", prefix: "cr" } })
    expect(r.status).toBe(201)
    expect(r.body.writeKey).toMatch(/^dsk_/)
    expect(r.body.project.writeKeyHash).toBeUndefined()
    expect(r.body.tokens).toMatchObject({ version: 1, brand: "bank", prefix: "cr", overrides: {}, custom: [] })
    key = r.body.writeKey
    expect((await api("/api/projects", { method: "POST", json: { name: "x", id: "credit" } })).status).toBe(409)
    const list = await api("/api/projects")
    expect(list.body.projects.map((p: { id: string }) => p.id)).toEqual(["credit"])
    const stored = JSON.parse(readFileSync(join(data, "projects", "credit", "project.json"), "utf8"))
    expect(stored.writeKeyHash).toHaveLength(64)
    expect(JSON.stringify(stored)).not.toContain(key)
  })

  it("rejects bad input at the boundary", async () => {
    expect((await api("/api/projects", { method: "POST", json: { name: "", id: "Bad Id" } })).body.errors.length).toBeGreaterThan(0)
    expect((await api("/api/projects", { method: "POST", body: "{}", headers: { "Content-Type": "text/plain" } })).status).toBe(415)
    expect((await api("/api/projects", { method: "POST", body: "{", headers: { "Content-Type": "application/json" } })).status).toBe(400)
    expect((await api("/api/projects/..%2Fetc")).status).toBe(404)
    const big = "x".repeat(300 * 1024)
    expect((await api("/api/projects", { method: "POST", json: { name: big } })).status).toBe(413)
  })

  it("project rows: shadcn tokens with Foundation aliases", async () => {
    const r = await api("/api/projects/credit")
    expect(r.status).toBe(200)
    expect(r.headers.get("etag")).toBe('"1"')
    const row = (n: string) => r.body.rows.find((x: { name: string }) => x.name === n)
    for (const n of ["background", "foreground", "primary", "primary-foreground", "muted-foreground", "border", "input", "ring", "radius"]) expect(row(n), n).toBeTruthy()
    expect(row("primary").base.source.light.alias).toMatchObject({ collection: "2.theme", name: "accent/primary/default" })
    expect(row("primary").base.source.light.alias.key).toMatch(/^[0-9a-f]{40}$/)
    expect(row("brand").base.source.light.alias).toMatchObject({ collection: "1.brand", name: "brand/default", mode: "bank" })
    expect(row("brand").base.source.dark.alias).toMatchObject({ collection: "2.theme", name: "brand/bank/default" })
    expect(row("ring").base.source.light).toEqual({ ref: "brand" })
    expect(row("radius")).toMatchObject({ kind: "radius", light: "12px" })
    expect(row("radius").base.source.light.alias).toMatchObject({ collection: "1.brand", name: "radius/m" })
    expect(row("radius-lg").scope).toBe("theme")
    expect(r.body.contrast.some((c: { fg: string; bg: string }) => c.fg === "primary-foreground" && c.bg === "primary")).toBe(true)
  })

  it("PUT tokens needs the key and If-Match; a stale version is a 409 conflict", async () => {
    const body = {
      brand: "bank", prefix: "cr",
      overrides: { primary: { light: "#7c3aed", dark: "#8b5cf6" }, ring: { light: "var(--primary)" }, "radius-lg": { light: "20px" } },
      custom: [{ name: "cr-promo", kind: "color", light: "#fef3c7", dark: "#451a03" }, { name: "cr-promo-foreground", kind: "color", light: "#451a03", dark: "#fef3c7" }, { name: "cr-card", kind: "radius", light: "20px", dark: "20px" }],
    }
    expect((await api("/api/projects/credit/tokens", { method: "PUT", json: body, headers: { "If-Match": '"1"' } })).status).toBe(401)
    expect((await api("/api/projects/credit/tokens", { method: "PUT", json: body, headers: { "If-Match": '"1"', "X-Write-Key": "dsk_wrong" } })).status).toBe(403)
    expect((await api("/api/projects/credit/tokens", { method: "PUT", json: body, headers: { "X-Write-Key": key } })).status).toBe(428)
    const ok = await api("/api/projects/credit/tokens", { method: "PUT", json: body, headers: { "If-Match": '"1"', "X-Write-Key": key } })
    expect(ok.status).toBe(200)
    expect(ok.body.tokens.version).toBe(2)
    expect(ok.headers.get("etag")).toBe('"2"')
    expect(ok.body.diff.added).toEqual(["cr-promo", "cr-promo-foreground", "cr-card"])
    // Someone else still edits from version 1: conflict with the current document.
    const stale = await api("/api/projects/credit/tokens", { method: "PUT", json: { ...body, overrides: {} }, headers: { "If-Match": "1", "X-Write-Key": key } })
    expect(stale.status).toBe(409)
    expect(stale.body.current.version).toBe(2)
    const history = await api("/api/projects/credit/history")
    expect(history.body.history.map((h: { version: number }) => h.version)).toEqual([2, 1])
  })

  it("validates token documents", async () => {
    const bad = await api("/api/projects/credit/tokens", {
      method: "PUT", headers: { "If-Match": "2", "X-Write-Key": key },
      json: { brand: "nope", prefix: "cr", overrides: { primary: { light: "red-ish" }, unknown: { light: "#fff" }, radius: { light: "12" } }, custom: [{ name: "promo", kind: "color", light: "#fff" }, { name: "cr-x", kind: "color", light: "var(--missing)" }] },
    })
    expect(bad.status).toBe(400)
    const text = bad.body.errors.join("\n")
    for (const part of ["brand", "overrides.primary.light", "overrides.unknown", "overrides.radius.light", "custom promo", "var(--missing)"]) expect(text).toContain(part)
  })

  it("outputs: tokens.css from tokens-build, registry:base, figma.json", async () => {
    const css = await api("/api/projects/credit/tokens.css")
    expect(css.headers.get("content-type")).toContain("text/css")
    expect(css.body).toContain('Project "Кредитный конвейер" (credit), version 2')
    expect(css.body).toMatch(/--primary: #7c3aed;\s+\/\* project override \*\//)
    expect(css.body).toContain("--cr-promo: #fef3c7;")
    expect(css.body).toContain("--color-cr-promo: var(--cr-promo);")
    expect(css.body).toContain("--radius-card: var(--cr-card);")
    expect(css.body).toContain("--radius-lg: 20px;")
    expect(css.body).toContain("--color-ring: var(--ring);")
    expect(css.body).toContain("@layer base") // the frontend-pack layout, same generator

    const item = await api("/r/credit.json")
    const validate = new Ajv({ strict: false, allErrors: true, validateSchema: false }).compile(schema)
    expect(validate(item.body)).toBe(true)
    expect(item.body).toMatchObject({ name: "credit", type: "registry:base", title: "Кредитный конвейер", meta: { project: "credit", version: 2 } })
    expect(item.body.cssVars.light.primary).toBe("#7c3aed")
    expect(item.body.cssVars.light["cr-promo"]).toBe("#fef3c7")
    expect(item.body.cssVars.theme["radius-lg"]).toBe("20px")

    const plan = await api("/api/projects/credit/figma.json")
    expect(plan.body).toMatchObject({ collection: "shadcn", modes: ["light", "dark"], version: 2, project: "credit" })
    const v = (n: string) => plan.body.variables.find((x: { name: string }) => x.name === n)
    expect(v("background").values.light.alias).toMatchObject({ collection: "2.theme", name: "background/surface/light" })
    expect(v("primary").values.light).toEqual({ value: "#7c3aed" })
    expect(v("primary").base.light.alias.name).toBe("accent/primary/default")
    expect(v("ring").values.light).toMatchObject({ ref: "primary", value: "#7c3aed" })
    expect(v("radius")).toMatchObject({ type: "FLOAT", scopes: ["CORNER_RADIUS"] })
    expect(v("radius").values.light.value).toBe(12)
    expect(v("cr-promo")).toMatchObject({ custom: true, type: "COLOR", codeSyntax: "var(--cr-promo)", values: { light: { value: "#fef3c7" }, dark: { value: "#451a03" } } })
    expect(v("cr-promo-foreground").scopes).toContain("TEXT_FILL")
  })

  it("links a Figma file and records a sync", async () => {
    const link = await api("/api/projects/credit/figma", { method: "PUT", headers: { "X-Write-Key": key }, json: { fileKey: "https://www.figma.com/design/AbCdEf1234567890/Credit-CRM?node-id=1-2" } })
    expect(link.status).toBe(200)
    expect(link.body.project.figma).toMatchObject({ fileKey: "AbCdEf1234567890", fileName: "Credit CRM" })
    expect((await api("/api/projects/credit/figma", { method: "PUT", headers: { "X-Write-Key": key }, json: { fileKey: "bad key!" } })).status).toBe(400)
    const sync = await api("/api/projects/credit/figma/sync", { method: "POST", headers: { "X-Write-Key": key }, json: { from: "site", version: 2 } })
    expect(sync.body.project.figma.lastSync).toMatchObject({ from: "site", version: 2 })
    // A push from the widget is marked as from figma.
    const put = await api("/api/projects/credit/tokens", { method: "PUT", headers: { "If-Match": "2", "X-Write-Key": key }, json: { brand: "bank", prefix: "cr", overrides: {}, custom: [], source: "figma" } })
    expect(put.body.tokens.updatedBy).toBe("figma")
    expect((await api("/api/projects/credit")).body.project.figma.lastSync).toMatchObject({ from: "figma", version: 3 })
  })

  it("rotates the write key; CORS for the widget", async () => {
    const r = await api("/api/projects/credit/key", { method: "POST", headers: { "X-Write-Key": key }, json: {} })
    expect(r.body.writeKey).not.toBe(key)
    expect((await api("/api/projects/credit/key", { method: "POST", headers: { "X-Write-Key": key }, json: {} })).status).toBe(403)
    const pre = await fetch(`${url}/api/projects/credit/tokens`, { method: "OPTIONS" })
    expect(pre.status).toBe(204)
    expect(pre.headers.get("access-control-allow-headers")).toContain("X-Write-Key")
    expect(pre.headers.get("access-control-allow-origin")).toBe("*")
  })
})
