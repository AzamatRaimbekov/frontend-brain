// The site API on a temp data folder: create, read, PUT with optimistic version (409), write key,
// Figma link, outputs (tokens.css, registry:base, figma.json), validation and the migration of
// documents stored before the switch to the plain shadcn token set.
import Ajv from "ajv"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { createServer, type Server } from "node:http"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { COLOR_NAMES } from "@/lib/tokens"
import schema from "@/upstream/registry-item.schema.json"

import { createApp } from "../server/app"

let server: Server
let url = ""
let data = ""

// A project stored by the previous version of the site (brand base, prefix, custom tokens).
function seedLegacy(dir: string) {
  const p = join(dir, "projects", "legacy")
  mkdirSync(p, { recursive: true })
  writeFileSync(join(p, "project.json"), JSON.stringify({ id: "legacy", name: "Legacy", base: "old", createdAt: "2026-11-01T00:00:00.000Z", writeKeyHash: "0".repeat(64), figma: null }))
  writeFileSync(join(p, "tokens.json"), JSON.stringify({
    version: 4, updatedAt: "2026-11-02T00:00:00.000Z", updatedBy: "figma", brand: "x", prefix: "lg",
    overrides: { primary: { light: "#7c3aed", dark: "var(--brand)" }, "status-ok": { light: "#fff" }, radius: { light: "12px", dark: "12px" }, "radius-lg": { light: "20px" } },
    custom: [{ name: "lg-promo", kind: "color", light: "#fff", dark: "#000" }],
  }))
}

beforeAll(async () => {
  data = mkdtempSync(join(tmpdir(), "ds-site-"))
  seedLegacy(data)
  const handle = await createApp({ dataDir: data, staticDir: join(data, "no-dist") })
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

  it("migrates stored projects: unknown tokens and invalid values dropped, valid values kept", async () => {
    const tokens = JSON.parse(readFileSync(join(data, "projects", "legacy", "tokens.json"), "utf8"))
    expect(tokens).toEqual({ version: 4, updatedAt: "2026-11-02T00:00:00.000Z", updatedBy: "figma", overrides: { radius: { light: "12px" } } })
    expect(JSON.parse(readFileSync(join(data, "projects", "legacy", "project.json"), "utf8")).base).toBe("shadcn")
  })

  it("creates a project on the shadcn defaults and returns the write key once", async () => {
    const r = await api("/api/projects", { method: "POST", json: { name: "Кредитный конвейер", id: "credit" } })
    expect(r.status).toBe(201)
    expect(r.body.writeKey).toMatch(/^dsk_/)
    expect(r.body.project).toMatchObject({ id: "credit", base: "shadcn" })
    expect(r.body.project.writeKeyHash).toBeUndefined()
    expect(r.body.tokens).toMatchObject({ version: 1, overrides: {} })
    expect(Object.keys(r.body.tokens).sort()).toEqual(["overrides", "updatedAt", "updatedBy", "version"])
    key = r.body.writeKey
    expect((await api("/api/projects", { method: "POST", json: { name: "x", id: "credit" } })).status).toBe(409)
    const list = await api("/api/projects")
    expect(list.body.projects.map((p: { id: string }) => p.id)).toEqual(["credit", "legacy"])
    expect(list.body.projects[0]).toMatchObject({ id: "credit", version: 1, overrides: 0 })
    const stored = JSON.parse(readFileSync(join(data, "projects", "credit", "project.json"), "utf8"))
    expect(stored.writeKeyHash).toHaveLength(64)
    expect(JSON.stringify(stored)).not.toContain(key)
  })

  it("rejects bad input at the boundary", async () => {
    expect((await api("/api/projects", { method: "POST", json: { name: "", id: "Bad Id" } })).body.errors.length).toBeGreaterThan(0)
    expect((await api("/api/projects", { method: "POST", json: { name: "x", id: "xx", brand: "bank" } })).body.errors.join()).toContain("brand")
    expect((await api("/api/projects", { method: "POST", body: "{}", headers: { "Content-Type": "text/plain" } })).status).toBe(415)
    expect((await api("/api/projects", { method: "POST", body: "{", headers: { "Content-Type": "application/json" } })).status).toBe(400)
    expect((await api("/api/projects/..%2Fetc")).status).toBe(404)
    const big = "x".repeat(300 * 1024)
    expect((await api("/api/projects", { method: "POST", json: { name: big } })).status).toBe(413)
  })

  it("project rows: the figma.json variables, contrast checks", async () => {
    const r = await api("/api/projects/credit")
    expect(r.status).toBe(200)
    expect(r.headers.get("etag")).toBe('"1"')
    const names = r.body.rows.map((x: { name: string }) => x.name)
    expect(names.slice(0, 31)).toEqual(COLOR_NAMES)
    expect(names.slice(31)).toEqual(["radius", "radius-sm", "radius-md", "radius-lg", "radius-xl", "radius-2xl", "radius-3xl", "radius-4xl", "font-sans", "font-heading"])
    const row = (n: string) => r.body.rows.find((x: { name: string }) => x.name === n)
    expect(row("primary")).toMatchObject({ kind: "color", editable: true, overridden: false, values: { light: { value: "#171717", css: "oklch(0.205 0 0)" } } })
    expect(r.body.contrast.some((c: { fg: string; bg: string }) => c.fg === "primary-foreground" && c.bg === "primary")).toBe(true)
    // Stock shadcn neutral: muted-foreground on muted is 4.35:1 in light, the only pair below AA.
    expect(r.body.contrast.filter((c: { ok: boolean }) => !c.ok)).toEqual([{ fg: "muted-foreground", bg: "muted", mode: "light", ratio: 4.35, ok: false }])
  })

  it("PUT tokens needs the key and If-Match; a stale version is a 409 conflict", async () => {
    const body = { overrides: { primary: { light: "#7c3aed", dark: "oklch(0.7 0.2 290)" }, ring: { light: "var(--primary)" }, radius: { light: "0.5rem" }, "font-sans": { light: "'Inter', sans-serif" }, muted: { light: "oklch(0.97 0 0)" } } }
    expect((await api("/api/projects/credit/tokens", { method: "PUT", json: body, headers: { "If-Match": '"1"' } })).status).toBe(401)
    expect((await api("/api/projects/credit/tokens", { method: "PUT", json: body, headers: { "If-Match": '"1"', "X-Write-Key": "dsk_wrong" } })).status).toBe(403)
    expect((await api("/api/projects/credit/tokens", { method: "PUT", json: body, headers: { "X-Write-Key": key } })).status).toBe(428)
    const ok = await api("/api/projects/credit/tokens", { method: "PUT", json: body, headers: { "If-Match": '"1"', "X-Write-Key": key } })
    expect(ok.status).toBe(200)
    expect(ok.body.tokens.version).toBe(2)
    expect(ok.headers.get("etag")).toBe('"2"')
    expect(ok.body.tokens.overrides.muted).toBeUndefined() // same as the default: dropped
    expect(ok.body.diff.changed.sort()).toEqual(["font-sans", "primary", "radius", "ring"])
    const stale = await api("/api/projects/credit/tokens", { method: "PUT", json: { overrides: {} }, headers: { "If-Match": "1", "X-Write-Key": key } })
    expect(stale.status).toBe(409)
    expect(stale.body.current.version).toBe(2)
    const history = await api("/api/projects/credit/history")
    expect(history.body.history.map((h: { version: number }) => h.version)).toEqual([2, 1])
  })

  it("validates token documents: only shadcn names, safe values, no custom tokens", async () => {
    const bad = await api("/api/projects/credit/tokens", {
      method: "PUT", headers: { "If-Match": "2", "X-Write-Key": key },
      json: {
        brand: "bank", prefix: "cr", custom: [{ name: "cr-x", kind: "color", light: "#fff" }],
        overrides: {
          primary: { light: "red-ish" }, "status-ok": { light: "#fff" }, "radius-lg": { light: "20px" }, radius: { light: "12", dark: "8px" },
          secondary: { light: "var(--brand)" }, accent: { light: "oklch(0.5 0.1 20;} body{x:1)" }, "font-sans": { light: "Inter; } body { color: red" },
          "font-heading": { light: "var(--primary)" }, border: { light: "var(--input)" }, input: { light: "var(--border)" },
        },
      },
    })
    expect(bad.status).toBe(400)
    const text = bad.body.errors.join("\n")
    for (const part of ["brand:", "prefix:", "custom:", "overrides.primary.light", "overrides.status-ok", "overrides.radius-lg", "overrides.radius.light", "overrides.radius.dark", "overrides.secondary.light", "overrides.accent.light", "overrides.font-sans.light", "overrides.font-heading.light"]) {
      expect(text, part).toContain(part)
    }
    const cycle = await api("/api/projects/credit/tokens", { method: "PUT", headers: { "If-Match": "2", "X-Write-Key": key }, json: { overrides: { border: { light: "var(--input)" }, input: { light: "var(--border)" } } } })
    expect(cycle.status).toBe(400)
    expect(cycle.body.errors.join()).toContain("цикл")
  })

  it("outputs: tokens.css, registry:base, figma.json with shadcn names only", async () => {
    const css = await api("/api/projects/credit/tokens.css")
    expect(css.headers.get("content-type")).toContain("text/css")
    expect(css.body).toContain('Project "Кредитный конвейер" (credit), version 2.')
    expect(css.body).toContain("--primary: #7c3aed;")
    expect(css.body).toContain("--ring: var(--primary);")
    expect(css.body).toContain("--radius: 0.5rem;")
    expect(css.body).toContain("--font-sans: 'Inter', sans-serif;")
    expect(css.body.match(/--color-[\w-]+:/g)).toHaveLength(31)
    expect(css.body).toContain("@layer base")

    const item = await api("/r/credit.json")
    const validate = new Ajv({ strict: false, allErrors: true, validateSchema: false }).compile(schema)
    expect(validate(item.body)).toBe(true)
    expect(item.body).toMatchObject({ name: "credit", type: "registry:base", title: "Кредитный конвейер", meta: { project: "credit", version: 2 } })
    expect(item.body.cssVars.light.primary).toBe("#7c3aed")
    expect(item.body.cssVars.dark.primary).toBe("oklch(0.7 0.2 290)")
    expect(Object.keys(item.body.cssVars.dark)).toEqual(COLOR_NAMES)

    const plan = await api("/api/projects/credit/figma.json")
    expect(plan.body).toMatchObject({ $schema: "ds-configurator/figma-plan@2", collection: "shadcn", modes: ["Light", "Dark"], version: 2, project: "credit", name: "Кредитный конвейер" })
    expect(plan.body.brand).toBeUndefined()
    expect(plan.body.prefix).toBeUndefined()
    const v = (n: string) => plan.body.variables.find((x: { name: string }) => x.name === n)
    expect(v("primary")).toMatchObject({ overridden: true, values: { light: { value: "#7c3aed", css: "#7c3aed" } }, base: { light: { css: "oklch(0.205 0 0)" } } })
    expect(v("ring").values.light).toEqual({ value: "#7c3aed", css: "var(--primary)", ref: "primary" })
    expect(v("radius").values.light.value).toBe(8)
    expect(v("radius-lg").values.light.value).toBe(8)
    expect(v("font-sans").values.light.value).toBe("Inter")
    expect(JSON.stringify(plan.body)).not.toContain("alias")
  })

  it("links a Figma file and records a sync", async () => {
    const link = await api("/api/projects/credit/figma", { method: "PUT", headers: { "X-Write-Key": key }, json: { fileKey: "https://www.figma.com/design/AbCdEf1234567890/Credit-CRM?node-id=1-2" } })
    expect(link.status).toBe(200)
    expect(link.body.project.figma).toMatchObject({ fileKey: "AbCdEf1234567890", fileName: "Credit CRM" })
    expect((await api("/api/projects/credit/figma", { method: "PUT", headers: { "X-Write-Key": key }, json: { fileKey: "bad key!" } })).status).toBe(400)
    const sync = await api("/api/projects/credit/figma/sync", { method: "POST", headers: { "X-Write-Key": key }, json: { from: "site", version: 2 } })
    expect(sync.body.project.figma.lastSync).toMatchObject({ from: "site", version: 2 })
    const put = await api("/api/projects/credit/tokens", { method: "PUT", headers: { "If-Match": "2", "X-Write-Key": key }, json: { overrides: {}, source: "figma" } })
    expect(put.body.tokens.updatedBy).toBe("figma")
    expect((await api("/api/projects/credit")).body.project.figma.lastSync).toMatchObject({ from: "figma", version: 3 })
  })

  it("accepts the widget push shape (oklch, px radius with equal dark, font stack, var refs)", async () => {
    const body = { source: "figma", overrides: {
      primary: { light: "oklch(0.5 0.2 290)", dark: "oklch(1 0 0 / 10%)" }, ring: { light: "var(--primary)", dark: "var(--primary)" },
      radius: { light: "8px", dark: "8px" }, "font-sans": { light: "'Inter', sans-serif" }, "font-heading": { light: "var(--font-sans)" },
    } }
    const r = await api("/api/projects/credit/tokens", { method: "PUT", json: body, headers: { "If-Match": "3", "X-Write-Key": key } })
    expect(r.status, JSON.stringify(r.body)).toBe(200)
    expect(r.body.tokens.overrides).toEqual({ primary: body.overrides.primary, ring: body.overrides.ring, radius: { light: "8px" }, "font-sans": { light: "'Inter', sans-serif" } })
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
