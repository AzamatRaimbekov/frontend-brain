// File storage of projects: data/projects/<id>/{project.json, tokens.json, history.jsonl}.
// Writes are atomic (temp file + rename) and serialised per project, so a version check and the
// write that follows it cannot interleave inside this process.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto"
import { existsSync } from "node:fs"
import { appendFile, mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises"
import { join } from "node:path"

import type { ExtraToken } from "@/lib/types"

import type { FigmaLink, Override } from "./validate"

export type LastSync = { from: "site" | "figma"; at: string; version: number }
export type Project = {
  id: string
  name: string
  base: "mbank"
  createdAt: string
  writeKeyHash: string
  figma: (Partial<FigmaLink> & { lastSync?: LastSync }) | null
}
export type TokensDoc = {
  version: number
  updatedAt: string
  updatedBy: "site" | "figma"
  brand: string
  prefix: string
  overrides: Record<string, Override>
  custom: ExtraToken[]
}
export type HistoryEntry = { at: string; version: number; by: "site" | "figma"; changed: string[]; added: string[]; removed: string[] }

export class Conflict extends Error {
  constructor(public current: TokensDoc) {
    super(`Версия на сайте уже ${current.version}`)
  }
}

export const hashKey = (key: string) => createHash("sha256").update(key).digest("hex")
export const newKey = () => `dsk_${randomBytes(24).toString("base64url")}`

export function keyMatches(project: Project, key: string | undefined) {
  if (!key) return false
  const a = Buffer.from(hashKey(key), "hex")
  const b = Buffer.from(project.writeKeyHash, "hex")
  return a.length === b.length && timingSafeEqual(a, b)
}

/** What changed between two token documents (names), for history and the sync report. */
export function diffDocs(prev: TokensDoc | null, next: Omit<TokensDoc, "version" | "updatedAt" | "updatedBy">) {
  const before = new Map(Object.entries(prev?.overrides ?? {}).map(([k, v]) => [k, JSON.stringify(v)]))
  const after = new Map(Object.entries(next.overrides).map(([k, v]) => [k, JSON.stringify(v)]))
  const changed = [...new Set([...before.keys(), ...after.keys()])].filter((k) => before.get(k) !== after.get(k))
  const oldCustom = new Map((prev?.custom ?? []).map((t) => [t.name, JSON.stringify(t)]))
  const newCustom = new Map(next.custom.map((t) => [t.name, JSON.stringify(t)]))
  const added = [...newCustom.keys()].filter((k) => !oldCustom.has(k))
  const removed = [...oldCustom.keys()].filter((k) => !newCustom.has(k))
  for (const [k, v] of newCustom) if (oldCustom.has(k) && oldCustom.get(k) !== v) changed.push(k)
  if (prev && (prev.brand !== next.brand || prev.prefix !== next.prefix)) changed.push(prev.brand !== next.brand ? "brand" : "prefix")
  return { changed, added, removed }
}

export function createStore(dataDir: string) {
  const root = join(dataDir, "projects")
  const dir = (id: string) => join(root, id)
  const locks = new Map<string, Promise<unknown>>()

  async function locked<T>(id: string, fn: () => Promise<T>): Promise<T> {
    const prev = locks.get(id) ?? Promise.resolve()
    const run = prev.then(fn, fn)
    locks.set(id, run.catch(() => undefined))
    return run
  }

  async function writeJson(path: string, value: unknown) {
    const tmp = `${path}.${process.pid}.${Date.now()}.tmp`
    await writeFile(tmp, `${JSON.stringify(value, null, 1)}\n`)
    await rename(tmp, path)
  }
  const readJson = async <T>(path: string): Promise<T | null> => {
    try {
      return JSON.parse(await readFile(path, "utf8")) as T
    } catch {
      return null
    }
  }

  const getProject = (id: string) => readJson<Project>(join(dir(id), "project.json"))
  const getTokens = (id: string) => readJson<TokensDoc>(join(dir(id), "tokens.json"))

  async function list() {
    if (!existsSync(root)) return []
    const ids = (await readdir(root, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort()
    const out: { project: Project; tokens: TokensDoc }[] = []
    for (const id of ids) {
      const [project, tokens] = await Promise.all([getProject(id), getTokens(id)])
      if (project && tokens) out.push({ project, tokens })
    }
    return out
  }

  /** Creates a project; returns null when the id is taken. The plain write key is returned once. */
  async function create(input: { id: string; name: string; brand: string; prefix: string }) {
    return locked(input.id, async () => {
      if (existsSync(join(dir(input.id), "project.json"))) return null
      await mkdir(dir(input.id), { recursive: true })
      const writeKey = newKey()
      const at = new Date().toISOString()
      const project: Project = { id: input.id, name: input.name, base: "mbank", createdAt: at, writeKeyHash: hashKey(writeKey), figma: null }
      const tokens: TokensDoc = { version: 1, updatedAt: at, updatedBy: "site", brand: input.brand, prefix: input.prefix, overrides: {}, custom: [] }
      await writeJson(join(dir(input.id), "tokens.json"), tokens)
      await writeJson(join(dir(input.id), "project.json"), project)
      await appendFile(join(dir(input.id), "history.jsonl"), `${JSON.stringify({ at, version: 1, by: "site", changed: [], added: [], removed: [] })}\n`)
      return { project, tokens, writeKey }
    })
  }

  /** Replaces the token document when `expected` is the current version; else throws Conflict. */
  async function putTokens(id: string, expected: number, next: Omit<TokensDoc, "version" | "updatedAt" | "updatedBy">, by: "site" | "figma") {
    return locked(id, async () => {
      const current = await getTokens(id)
      if (!current) throw new Error(`Нет проекта ${id}`)
      if (current.version !== expected) throw new Conflict(current)
      const at = new Date().toISOString()
      const doc: TokensDoc = { version: current.version + 1, updatedAt: at, updatedBy: by, ...next }
      const diff = diffDocs(current, next)
      await writeJson(join(dir(id), "tokens.json"), doc)
      const entry: HistoryEntry = { at, version: doc.version, by, ...diff }
      await appendFile(join(dir(id), "history.jsonl"), `${JSON.stringify(entry)}\n`)
      if (by === "figma") await patchProject(id, (p) => ({ ...p, figma: { ...(p.figma ?? {}), lastSync: { from: "figma", at, version: doc.version } } }), false)
      return { doc, diff }
    })
  }

  async function patchProject(id: string, fn: (p: Project) => Project, lock = true) {
    const run = async () => {
      const p = await getProject(id)
      if (!p) throw new Error(`Нет проекта ${id}`)
      const next = fn(p)
      await writeJson(join(dir(id), "project.json"), next)
      return next
    }
    return lock ? locked(id, run) : run()
  }

  async function history(id: string, limit = 50): Promise<HistoryEntry[]> {
    try {
      const lines = (await readFile(join(dir(id), "history.jsonl"), "utf8")).trim().split("\n").filter(Boolean)
      return lines.slice(-limit).reverse().map((l) => JSON.parse(l) as HistoryEntry)
    } catch {
      return []
    }
  }

  return { list, create, getProject, getTokens, putTokens, patchProject, history }
}

export type Store = ReturnType<typeof createStore>
