// File storage of projects: data/projects/<id>/{project.json, tokens.json, history.jsonl}.
// Writes are atomic (temp file + rename) and serialised per project, so a version check and the
// write that follows it cannot interleave inside this process. Documents from before the switch to
// the plain shadcn token set (an older base with brands, a prefix and custom tokens) are migrated on startup.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto"
import { existsSync } from "node:fs"
import { appendFile, mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { cleanOverrides, type FigmaLink, type Overrides } from "./validate"

export type LastSync = { from: "site" | "figma"; at: string; version: number }
export type Project = {
  id: string
  name: string
  base: "shadcn"
  createdAt: string
  writeKeyHash: string
  figma: (Partial<FigmaLink> & { lastSync?: LastSync }) | null
}
export type TokensDoc = {
  version: number
  updatedAt: string
  updatedBy: "site" | "figma"
  overrides: Overrides
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
export function diffDocs(prev: Pick<TokensDoc, "overrides"> | null, next: Pick<TokensDoc, "overrides">) {
  const before = new Map(Object.entries(prev?.overrides ?? {}).map(([k, v]) => [k, JSON.stringify(v)]))
  const after = new Map(Object.entries(next.overrides).map(([k, v]) => [k, JSON.stringify(v)]))
  const changed = [...new Set([...before.keys(), ...after.keys()])].filter((k) => before.get(k) !== after.get(k))
  return { changed, added: [] as string[], removed: [] as string[] }
}

/** A stored document of any age -> the current shape: unknown names and invalid values dropped. */
export function migrateDoc(raw: Record<string, unknown>): { doc: TokensDoc; dropped: string[] } {
  const overrides = (raw.overrides && typeof raw.overrides === "object" ? raw.overrides : {}) as Record<string, unknown>
  const dropped: string[] = []
  const keep: Record<string, unknown> = {}
  for (const [name, o] of Object.entries(overrides)) {
    const one = cleanOverrides({ [name]: o })
    if (one.errors.length) dropped.push(name)
    else Object.assign(keep, one.overrides)
  }
  let all = cleanOverrides(keep) // var() chains across the kept names
  if (all.errors.length) {
    dropped.push(...Object.keys(keep))
    all = { overrides: {}, errors: [] }
  }
  const custom = Array.isArray(raw.custom) ? raw.custom.map((t) => String((t as { name?: unknown }).name)) : []
  return {
    doc: {
      version: Number(raw.version) || 1,
      updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
      updatedBy: raw.updatedBy === "figma" ? "figma" : "site",
      overrides: all.overrides,
    },
    dropped: [...dropped, ...custom],
  }
}

const isCurrent = (raw: Record<string, unknown>, doc: TokensDoc) =>
  JSON.stringify(Object.keys(raw).sort()) === JSON.stringify(Object.keys(doc).sort()) && JSON.stringify(raw.overrides) === JSON.stringify(doc.overrides)

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

  /** Rewrites every project stored in an older shape. Returns what was dropped, by project. */
  async function migrateAll() {
    if (!existsSync(root)) return {}
    const report: Record<string, string[]> = {}
    for (const d of await readdir(root, { withFileTypes: true })) {
      if (!d.isDirectory()) continue
      await locked(d.name, async () => {
        const project = await readJson<Record<string, unknown>>(join(dir(d.name), "project.json"))
        const raw = await readJson<Record<string, unknown>>(join(dir(d.name), "tokens.json"))
        if (!project || !raw) return
        if (project.base !== "shadcn") await writeJson(join(dir(d.name), "project.json"), { ...project, base: "shadcn" })
        const { doc, dropped } = migrateDoc(raw)
        if (isCurrent(raw, doc)) return
        await writeJson(join(dir(d.name), "tokens.json"), doc)
        report[d.name] = dropped
      })
    }
    return report
  }

  /** Creates a project; returns null when the id is taken. The plain write key is returned once. */
  async function create(input: { id: string; name: string }) {
    return locked(input.id, async () => {
      if (existsSync(join(dir(input.id), "project.json"))) return null
      await mkdir(dir(input.id), { recursive: true })
      const writeKey = newKey()
      const at = new Date().toISOString()
      const project: Project = { id: input.id, name: input.name, base: "shadcn", createdAt: at, writeKeyHash: hashKey(writeKey), figma: null }
      const tokens: TokensDoc = { version: 1, updatedAt: at, updatedBy: "site", overrides: {} }
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

  return { list, migrateAll, create, getProject, getTokens, putTokens, patchProject, history }
}

export type Store = ReturnType<typeof createStore>
