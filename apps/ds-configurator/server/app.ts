// HTTP API of the design-system site. Reads are public (shadcn CLI, the widget); every write needs
// the project's write key in X-Write-Key, and a token write needs If-Match with the current version.
import type { IncomingMessage, ServerResponse } from "node:http"

import { loadBase, type BaseSource } from "./base"
import { HttpError, ifMatch, readJson, send, serveStatic } from "./http"
import { figmaPlan, registryItem, tokensCss } from "./outputs"
import { contrastChecks, resolveProject } from "./resolve"
import { Conflict, createStore, keyMatches, newKey, hashKey, type Project, type TokensDoc } from "./store"
import { PROJECT_ID, validateCreate, validateFigmaLink, validateSync, validateTokens } from "./validate"

export type AppOptions = { dataDir: string; frontendPackDir: string; staticDir: string }

const publicProject = ({ writeKeyHash: _hash, ...p }: Project) => p
const etag = (doc: TokensDoc) => ({ ETag: `"${doc.version}"` })

export async function createApp(opts: AppOptions) {
  const base: BaseSource = await loadBase(opts.frontendPackDir)
  const store = createStore(opts.dataDir)
  const baseKinds = new Map(resolveProject(base, { version: 0, updatedAt: "", updatedBy: "site", brand: base.brands[0], prefix: "mb", overrides: {}, custom: [] })
    .rows.map((r) => [r.name, r.kind]))

  async function load(id: string) {
    if (!PROJECT_ID.test(id)) throw new HttpError(404, "Нет такого проекта")
    const [project, tokens] = await Promise.all([store.getProject(id), store.getTokens(id)])
    if (!project || !tokens) throw new HttpError(404, `Нет проекта ${id}`)
    return { project, tokens }
  }

  function authorize(req: IncomingMessage, project: Project) {
    const key = req.headers["x-write-key"]
    if (!key) throw new HttpError(401, "Нужен ключ записи проекта (заголовок X-Write-Key)")
    if (!keyMatches(project, String(key))) throw new HttpError(403, "Ключ записи не подходит к проекту")
  }

  const summary = ({ project, tokens }: { project: Project; tokens: TokensDoc }) => ({
    ...publicProject(project), version: tokens.version, updatedAt: tokens.updatedAt, updatedBy: tokens.updatedBy,
    brand: tokens.brand, overrides: Object.keys(tokens.overrides).length, custom: tokens.custom.length,
  })

  async function route(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? "/", "http://localhost")
    const path = url.pathname.replace(/\/+$/, "") || "/"
    const method = req.method ?? "GET"
    if (method === "OPTIONS") return send(res, 204, "")

    if (path === "/api/health") return send(res, 200, { ok: true, base: "mbank", brands: base.brands })
    if (path === "/api/projects" && method === "GET") return send(res, 200, { projects: (await store.list()).map(summary) })
    if (path === "/api/projects" && method === "POST") {
      const input = validateCreate(await readJson(req), base.brands)
      if (input.errors) throw new HttpError(400, "Проверьте поля", { errors: input.errors })
      const made = await store.create(input.value)
      if (!made) throw new HttpError(409, `Проект ${input.value.id} уже есть`)
      return send(res, 201, { project: publicProject(made.project), tokens: made.tokens, writeKey: made.writeKey }, etag(made.tokens))
    }

    const reg = /^\/r\/([^/]+)\.json$/.exec(path)
    if (reg && method === "GET") {
      const { project, tokens } = await load(reg[1])
      return send(res, 200, registryItem(project, tokens, resolveProject(base, tokens)), etag(tokens))
    }

    const m = /^\/api\/projects\/([^/]+)(\/.*)?$/.exec(path)
    if (!m) {
      if (path.startsWith("/api/") || path.startsWith("/r/")) throw new HttpError(404, "Нет такого адреса API")
      return serveStatic(res, opts.staticDir, path)
    }
    const [, id, sub = ""] = m
    const { project, tokens } = await load(id)

    if (sub === "" && method === "GET") {
      const resolved = resolveProject(base, tokens)
      return send(res, 200, { project: publicProject(project), tokens, rows: resolved.rows, contrast: contrastChecks(resolved.rows), brands: base.brands }, etag(tokens))
    }
    if (sub === "/tokens" && method === "GET") return send(res, 200, tokens, etag(tokens))
    if (sub === "/tokens" && method === "PUT") {
      authorize(req, project)
      const expected = ifMatch(req)
      if (expected === null) throw new HttpError(428, "Нужен заголовок If-Match с версией, от которой сделана правка")
      if (Number.isNaN(expected)) throw new HttpError(400, "If-Match: номер версии")
      const body = await readJson(req)
      const input = validateTokens(body, baseKinds, base.brands)
      if (input.errors) throw new HttpError(400, "Проверьте токены", { errors: input.errors })
      const by = (body as { source?: unknown }).source === "figma" ? "figma" : "site"
      try {
        const { doc, diff } = await store.putTokens(id, expected, input.value, by)
        return send(res, 200, { tokens: doc, diff }, etag(doc))
      } catch (e) {
        if (e instanceof Conflict) throw new HttpError(409, `Конфликт: на сайте уже версия ${e.current.version}, правка сделана от ${expected}`, { current: e.current })
        throw e
      }
    }
    if (sub === "/figma" && method === "PUT") {
      authorize(req, project)
      const link = validateFigmaLink(await readJson(req))
      if (link.errors) throw new HttpError(400, "Проверьте ссылку", { errors: link.errors })
      const next = await store.patchProject(id, (p) => ({ ...p, figma: { ...(p.figma ?? {}), ...link.value } }))
      return send(res, 200, { project: publicProject(next) })
    }
    if (sub === "/figma/sync" && method === "POST") {
      authorize(req, project)
      const sync = validateSync(await readJson(req))
      if (sync.errors) throw new HttpError(400, "Проверьте отметку синхронизации", { errors: sync.errors })
      const { from, version, ...file } = sync.value
      const next = await store.patchProject(id, (p) => ({ ...p, figma: { ...(p.figma ?? {}), ...file, lastSync: { from, version, at: new Date().toISOString() } } }))
      return send(res, 200, { project: publicProject(next) })
    }
    if (sub === "/key" && method === "POST") {
      authorize(req, project)
      const writeKey = newKey()
      await store.patchProject(id, (p) => ({ ...p, writeKeyHash: hashKey(writeKey) }))
      return send(res, 200, { writeKey })
    }
    if (sub === "/history" && method === "GET") return send(res, 200, { history: await store.history(id) })
    if (sub === "/tokens.css" && method === "GET") {
      const css = tokensCss(base, project, tokens, resolveProject(base, tokens))
      return send(res, 200, css, { "Content-Type": "text/css; charset=utf-8", ...etag(tokens) })
    }
    if (sub === "/figma.json" && method === "GET") return send(res, 200, figmaPlan(project, tokens, resolveProject(base, tokens)), etag(tokens))
    throw new HttpError(sub ? 404 : 405, sub ? "Нет такого адреса API" : "Метод не поддерживается")
  }

  return async function handle(req: IncomingMessage, res: ServerResponse) {
    try {
      await route(req, res)
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, { error: e.message, ...e.body })
      console.error(e)
      send(res, 500, { error: "Внутренняя ошибка сервера" })
    }
  }
}
