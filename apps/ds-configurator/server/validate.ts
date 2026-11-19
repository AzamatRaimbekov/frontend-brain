// Input validation at the API boundary: project creation, token documents (overrides of the
// standard shadcn names only), Figma link settings. Every function returns { value } or { errors }.
import { parseCssColor } from "@/lib/color"
import { COLOR_NAMES, EDITABLE, SHADCN_TOKENS, applyOverrides, colorHex, valueOf, type Override, type Overrides, type TokenKind } from "@/lib/tokens"

export type { Override, Overrides }
export type TokensInput = { overrides: Overrides }
export type Result<T> = { value: T; errors?: undefined } | { value?: undefined; errors: string[] }

export const PROJECT_ID = /^[a-z][a-z0-9-]{1,39}$/
const LENGTH = /^(0|\d+(\.\d+)?(px|rem))$/
const REF = /^var\(--([\w-]+)\)$/
// Values go into tokens.css verbatim: only characters a colour / font list needs (no ; { } < >).
const COLOR_CHARS = /^[#a-z0-9.,%\s()/-]+$/i
const FONT = /^[A-Za-z0-9 '",._-]{1,120}$/
const FILE_KEY = /^[A-Za-z0-9]{10,64}$/

const isObject = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x)
const str = (x: unknown, max = 200) => (typeof x === "string" && x.length <= max ? x.trim() : null)

function unknownKeys(body: Record<string, unknown>, allowed: string[]) {
  return Object.keys(body).filter((k) => !allowed.includes(k)).map((k) => `${k}: поле не поддерживается (только ${allowed.join(", ")})`)
}

export function validateCreate(body: unknown): Result<{ id: string; name: string }> {
  if (!isObject(body)) return { errors: ["Тело запроса — JSON-объект"] }
  const errors = unknownKeys(body, ["name", "id"])
  const name = str(body.name, 80)
  if (!name) errors.push("name: строка до 80 символов")
  const id = str(body.id ?? "", 40) || slug(name ?? "")
  if (!PROJECT_ID.test(id)) errors.push("id: латиница в нижнем регистре, цифры и дефисы, 2–40 символов, начинается с буквы")
  return errors.length ? { errors } : { value: { id, name: name as string } }
}

export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/^[^a-z]+/, "").slice(0, 40)

/** null = valid; else the reason. */
export function checkValue(name: string, kind: TokenKind, value: unknown): string | null {
  if (typeof value !== "string" || !value.trim() || value.length > 120) return "нужно значение-строка до 120 символов"
  const v = value.trim()
  const ref = REF.exec(v)
  if (kind === "color") {
    if (ref) return COLOR_NAMES.includes(ref[1]) && ref[1] !== name ? null : `var(--${ref[1]}): можно ссылаться только на другой цвет shadcn`
    return COLOR_CHARS.test(v) && parseCssColor(v) ? null : "не цвет (hex, oklch(), rgb() или var(--цвет))"
  }
  if (kind === "radius") return LENGTH.test(v) ? null : "нужна длина в px или rem (например 0.625rem)"
  if (ref) return name === "font-heading" && ref[1] === "font-sans" ? null : "из ссылок допустима только var(--font-sans) у font-heading"
  return FONT.test(v) ? null : "список шрифтов CSS: буквы, цифры, пробелы, кавычки, запятые"
}

/** Overrides of the shadcn names; values equal to the shadcn default are dropped. Returns errors by name. */
export function cleanOverrides(raw: Record<string, unknown>): { overrides: Overrides; errors: string[] } {
  const errors: string[] = []
  const overrides: Overrides = {}
  for (const [name, o] of Object.entries(raw)) {
    const kind = EDITABLE.get(name)
    if (!kind) { errors.push(`overrides.${name}: нет такого токена shadcn (свои токены не поддерживаются)`); continue }
    if (!isObject(o)) { errors.push(`overrides.${name}: объект { light?, dark? }`); continue }
    const extra = Object.keys(o).filter((k) => k !== "light" && k !== "dark")
    if (extra.length) errors.push(`overrides.${name}: лишние поля ${extra.join(", ")}`)
    const entry: Override = {}
    for (const mode of ["light", "dark"] as const) {
      if (o[mode] === undefined || o[mode] === null) continue
      if (kind !== "color" && mode === "dark") {
        if (String(o.dark).trim() !== String(o.light ?? "").trim()) errors.push(`overrides.${name}.dark: одно значение на обе темы, передайте только light`)
        continue
      }
      const err = checkValue(name, kind, o[mode])
      if (err) { errors.push(`overrides.${name}.${mode}: ${err}`); continue }
      const v = String(o[mode]).trim()
      if (v !== valueOf(SHADCN_TOKENS, name, mode)) entry[mode] = v
    }
    if (entry.light !== undefined || entry.dark !== undefined) overrides[name] = entry
  }
  // var() chains between colours must end in a colour (no cycles).
  if (!errors.length) {
    const values = applyOverrides(SHADCN_TOKENS, overrides)
    for (const name of Object.keys(overrides)) {
      if (EDITABLE.get(name) !== "color") continue
      for (const mode of ["light", "dark"] as const) if (!colorHex(values, name, mode)) errors.push(`overrides.${name}.${mode}: ссылка var() не приводит к цвету (цикл?)`)
    }
  }
  return { overrides, errors }
}

/** A token document from the site or the widget: { overrides, source? }. */
export function validateTokens(body: unknown): Result<TokensInput> {
  if (!isObject(body)) return { errors: ["Тело запроса — JSON-объект"] }
  const errors = unknownKeys(body, ["overrides", "source", "custom"])
  if (body.custom !== undefined && !(Array.isArray(body.custom) && body.custom.length === 0)) {
    errors.push("custom: свои токены больше не поддерживаются — только значения стандартных токенов shadcn")
  }
  if (body.source !== undefined && body.source !== "site" && body.source !== "figma") errors.push("source: site | figma")
  if (body.overrides !== undefined && !isObject(body.overrides)) errors.push("overrides: объект { токен: { light?, dark? } }")
  const cleaned = cleanOverrides(isObject(body.overrides) ? body.overrides : {})
  errors.push(...cleaned.errors)
  return errors.length ? { errors } : { value: { overrides: cleaned.overrides } }
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
