// HTTP client of the site API (server/app.ts) with a typed error. Same origin in production;
// in `npm run dev` Vite proxies /api and /r to the server on 8797.
import type { ContrastCheck, Row } from "../../server/resolve"
import type { HistoryEntry, Project, TokensDoc } from "../../server/store"
import type { TokensInput } from "../../server/validate"

export type { ContrastCheck, HistoryEntry, Row, TokensDoc, TokensInput }
export type PublicProject = Omit<Project, "writeKeyHash">
export type ProjectSummary = PublicProject & { version: number; updatedAt: string; updatedBy: string; brand: string; overrides: number; custom: number }
export type ProjectDetail = { project: PublicProject; tokens: TokensDoc; rows: Row[]; contrast: ContrastCheck[]; brands: string[] }

export class ApiError extends Error {
  constructor(public status: number, message: string, public errors: string[] = [], public current?: TokensDoc) {
    super(message)
  }
}

type Init = { method?: string; json?: unknown; key?: string; version?: number }

async function request<T>(path: string, init: Init = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (init.json !== undefined) headers["Content-Type"] = "application/json"
  if (init.key) headers["X-Write-Key"] = init.key
  if (init.version !== undefined) headers["If-Match"] = `"${init.version}"`
  let res: Response
  try {
    res = await fetch(path, { method: init.method ?? "GET", headers, body: init.json === undefined ? undefined : JSON.stringify(init.json) })
  } catch {
    throw new ApiError(0, "Сервер сайта не отвечает. Запущен ли npm start (порт 8797)?")
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, body.error ?? `Ошибка ${res.status}`, body.errors ?? [], body.current)
  return body as T
}

export const api = {
  projects: () => request<{ projects: ProjectSummary[] }>("/api/projects").then((r) => r.projects),
  project: (id: string) => request<ProjectDetail>(`/api/projects/${encodeURIComponent(id)}`),
  history: (id: string) => request<{ history: HistoryEntry[] }>(`/api/projects/${encodeURIComponent(id)}/history`).then((r) => r.history),
  create: (input: { name: string; id?: string; brand: string; prefix: string }) =>
    request<{ project: PublicProject; tokens: TokensDoc; writeKey: string }>("/api/projects", { method: "POST", json: input }),
  putTokens: (id: string, key: string, version: number, tokens: TokensInput) =>
    request<{ tokens: TokensDoc }>(`/api/projects/${encodeURIComponent(id)}/tokens`, { method: "PUT", json: { ...tokens, source: "site" }, key, version }),
  linkFigma: (id: string, key: string, link: { fileKey: string; fileName?: string }) =>
    request<{ project: PublicProject }>(`/api/projects/${encodeURIComponent(id)}/figma`, { method: "PUT", json: link, key }),
  rotateKey: (id: string, key: string) => request<{ writeKey: string }>(`/api/projects/${encodeURIComponent(id)}/key`, { method: "POST", json: {}, key }),
}

export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
  history: (id: string) => [...projectKeys.all, "history", id] as const,
}

/** Absolute URLs the shadcn CLI and the widget use. */
export const siteUrls = (id: string, origin = window.location.origin) => ({
  site: origin,
  registry: `${origin}/r/${id}.json`,
  css: `${origin}/api/projects/${id}/tokens.css`,
  figma: `${origin}/api/projects/${id}/figma.json`,
})
