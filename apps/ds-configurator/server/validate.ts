// Input validation at the API boundary: project creation, token documents (overrides + custom
// tokens), Figma link settings. Every function returns { value } or { errors } and never throws.
import { parseCssColor } from "@/lib/color"
import { validateExtra } from "@/lib/extra-tokens"
import type { ExtraToken, ExtraTokenKind } from "@/lib/types"

import type { TokenKind } from "./base"

export type Override = { light?: string; dark?: string }
export type TokensInput = { brand: string; prefix: string; overrides: Record<string, Override>; custom: ExtraToken[] }
export type Result<T> = { value: T; errors?: undefined } | { value?: undefined; errors: string[] }

export const PROJECT_ID = /^[a-z][a-z0-9-]{1,39}$/
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
const LENGTH = /^(0|\d+(\.\d+)?(px|rem))$/
const REF = /^var\(--([\w-]+)\)$/
const FILE_KEY = /^[A-Za-z0-9]{10,64}$/
const KINDS: ExtraTokenKind[] = ["color", "radius", "size"]
const MAX_CUSTOM = 200

const isObject = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x)
const str = (x: unknown, max = 200) => (typeof x === "string" && x.length <= max ? x.trim() : null)

export function validateCreate(body: unknown, brands: string[]): Result<{ id: string; name: string; brand: string; prefix: string }> {
  if (!isObject(body)) return { errors: ["Тело запроса — JSON-объект"] }
  const errors: string[] = []
  const name = str(body.name, 80)
  if (!name) errors.push("name: строка до 80 символов")
  const id = str(body.id ?? "", 40) || slug(name ?? "")
  if (!PROJECT_ID.test(id)) errors.push("id: латиница в нижнем регистре, цифры и дефисы, 2–40 символов, начинается с буквы")
  const brand = str(body.brand ?? "bank", 20) ?? ""
  if (!brands.includes(brand)) errors.push(`brand: один из ${brands.join(", ")}`)
  const prefix = str(body.prefix ?? "mb", 12) ?? ""
  if (!KEBAB.test(prefix) || prefix.includes("-")) errors.push("prefix: одно слово латиницей (например mb)")
  return errors.length ? { errors } : { value: { id, name: name as string, brand, prefix } }
}

export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/^[^a-z]+/, "").slice(0, 40)

function checkValue(kind: TokenKind, value: unknown, known: Set<string>): string | null {
  if (typeof value !== "string" || !value.trim() || value.length > 120) return "нужно значение-строка"
  const v = value.trim()
  const ref = REF.exec(v)
  if (ref) return known.has(ref[1]) ? null : `var(--${ref[1]}): такого токена нет`
  if (kind === "color") return parseCssColor(v) ? null : "не цвет (hex, oklch(), rgb() или var(--токен))"
  return LENGTH.test(v) ? null : "нужна длина в px или rem (например 12px)"
}

/**
 * A token document from the site or the widget. `base` = base token name -> kind (overridable names).
 * Custom tokens follow the configurator rules (validateExtra): `<prefix>-<role>`, color/radius/size.
 */
export function validateTokens(body: unknown, base: Map<string, TokenKind>, brands: string[]): Result<TokensInput> {
  if (!isObject(body)) return { errors: ["Тело запроса — JSON-объект"] }
  const errors: string[] = []
  const brand = str(body.brand, 20) ?? ""
  if (!brands.includes(brand)) errors.push(`brand: один из ${brands.join(", ")}`)
  const prefix = str(body.prefix, 12) ?? ""
  if (!KEBAB.test(prefix) || prefix.includes("-")) errors.push("prefix: одно слово латиницей (например mb)")
  const rawCustom = body.custom ?? []
  if (!Array.isArray(rawCustom) || rawCustom.length > MAX_CUSTOM) errors.push(`custom: массив до ${MAX_CUSTOM} токенов`)
  const custom: ExtraToken[] = []
  const known = new Set([...base.keys(), ...(Array.isArray(rawCustom) ? rawCustom.map((t) => (isObject(t) ? String(t.name) : "")) : [])])
  const taken = new Set(base.keys())
  for (const [i, t] of (Array.isArray(rawCustom) ? rawCustom : []).entries()) {
    if (!isObject(t) || !KINDS.includes(t.kind as ExtraTokenKind)) { errors.push(`custom[${i}]: нужен объект с kind color | radius | size`); continue }
    const token: ExtraToken = {
      name: str(t.name, 64) ?? "", kind: t.kind as ExtraTokenKind,
      light: str(t.light, 120) ?? "", dark: str(t.dark ?? t.light, 120) ?? "",
      ...(typeof t.pairWith === "string" && t.pairWith && { pairWith: t.pairWith }),
    }
    const own = validateExtra(token, prefix, taken).filter((e) => !e.startsWith("Префикс"))
    for (const mode of ["light", "dark"] as const) {
      const ref = REF.exec(token[mode])
      if (ref && !known.has(ref[1])) own.push(`${mode}: var(--${ref[1]}): такого токена нет`)
    }
    if (token.pairWith && !known.has(token.pairWith)) own.push(`pairWith: нет токена ${token.pairWith}`)
    errors.push(...own.map((e) => `custom ${token.name || `[${i}]`}: ${e}`))
    taken.add(token.name)
    custom.push(token)
  }
  const overrides: Record<string, Override> = {}
  if (body.overrides !== undefined && !isObject(body.overrides)) errors.push("overrides: объект { токен: { light?, dark? } }")
  for (const [name, o] of Object.entries(isObject(body.overrides) ? body.overrides : {})) {
    const kind = base.get(name)
    if (!kind) { errors.push(`overrides.${name}: нет такого токена в базе (свой токен — в custom)`); continue }
    if (!isObject(o)) { errors.push(`overrides.${name}: объект { light?, dark? }`); continue }
    const entry: Override = {}
    for (const mode of ["light", "dark"] as const) {
      if (o[mode] === undefined || o[mode] === null) continue
      const err = checkValue(kind, o[mode], known)
      if (err) errors.push(`overrides.${name}.${mode}: ${err}`)
      else entry[mode] = String(o[mode]).trim()
    }
    if (entry.light !== undefined || entry.dark !== undefined) overrides[name] = entry
  }
  return errors.length ? { errors } : { value: { brand, prefix, overrides, custom } }
}

export type FigmaLink = { fileKey: string; fileName: string }

/** Figma link: a file key or a figma.com/design/<key>/<name> URL. */
export function validateFigmaLink(body: unknown): Result<FigmaLink> {
  if (!isObject(body)) return { errors: ["Тело запроса — JSON-объект"] }
  const raw = str(body.fileKey, 300) ?? ""
  const fromUrl = /figma\.com\/(?:design|file)\/([A-Za-z0-9]+)(?:\/branch\/([A-Za-z0-9]+))?(?:\/([^?#]*))?/.exec(raw)
  const fileKey = fromUrl ? (fromUrl[2] ?? fromUrl[1]) : raw
  const urlName = fromUrl?.[3] ? decodeURIComponent(fromUrl[3]).replace(/-/g, " ") : ""
  const fileName = (str(body.fileName, 120) ?? "") || urlName
  if (!FILE_KEY.test(fileKey)) return { errors: ["fileKey: ключ файла Figma (из ссылки figma.com/design/<ключ>/…)"] }
  return { value: { fileKey, fileName } }
}

export function validateSync(body: unknown): Result<{ from: "site" | "figma"; version: number; fileKey?: string; fileName?: string }> {
  if (!isObject(body)) return { errors: ["Тело запроса — JSON-объект"] }
  const from = body.from === "site" || body.from === "figma" ? body.from : null
  const version = Number(body.version)
  const errors: string[] = []
  if (!from) errors.push("from: site | figma")
  if (!Number.isInteger(version) || version < 1) errors.push("version: целое число ≥ 1")
  const fileKey = str(body.fileKey ?? "", 64) ?? ""
  if (fileKey && !FILE_KEY.test(fileKey)) errors.push("fileKey: ключ файла Figma")
  const fileName = str(body.fileName ?? "", 120) ?? ""
  return errors.length ? { errors } : { value: { from: from as "site" | "figma", version, ...(fileKey && { fileKey }), ...(fileName && { fileName }) } }
}
