// Base preset "mbank": the shadcn token set of the configurator (buildDesignSystem) with the Figma
// provenance of every value from frontend-pack tokens-build (tokens.json + tokens.map.json).
// tokens-build is imported at runtime from frontend-pack, not copied: one generator for tokens.css.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import { parseCssColor, resolveVar } from "@/lib/color"
import { buildDesignSystem } from "@/lib/design-system"
import { MBANK_BRANDS } from "@/lib/mbank"
import { DEFAULT_STATE, type ModeVars } from "@/lib/types"

export type Mode = "light" | "dark"
export type TokenKind = "color" | "radius" | "size"

/** Where a mode value comes from: a Foundation library variable, another token, or a plain value. */
export type ValueSource =
  | { alias: { collection: string; name: string; key: string | null; mode?: string } }
  | { ref: string }
  | { literal: true }

export type BaseToken = {
  name: string
  kind: TokenKind
  /** "root" = :root/.dark var, "theme" = @theme scale (radius-*). */
  scope: "root" | "theme"
  light: string
  dark: string
  source: Record<Mode, ValueSource>
}

type Decl = { prop?: string; value?: string; src?: { literal?: boolean; collection?: string; figma?: string; mode?: string } }
type Block = { selector: string; items: Decl[] }
export type TokensBuild = {
  buildModel: (tokens: unknown, map: unknown) => { blocks: Block[]; used: Set<string>; spacing: string[] }
  render: (model: unknown, map: unknown, tokens: unknown) => string
}

// Collection labels as tokens-build names them (COLLECTION_LABEL): the Figma library collection.
const LIBRARY: Record<string, { collection: string; section: string }> = {
  theme: { collection: "2.theme", section: "theme" },
  brand: { collection: "1.brand", section: "brand" },
  brandRadius: { collection: "1.brand", section: "brandRadius" },
}

export type BaseSource = {
  tokens: Record<string, { key?: string; vars?: { name: string; key?: string }[] } | unknown>
  map: Record<string, unknown>
  build: TokensBuild
  brands: string[]
}

export async function loadBase(frontendPackDir: string): Promise<BaseSource> {
  const dir = join(frontendPackDir, "registry", "mbank")
  const read = (f: string) => JSON.parse(readFileSync(join(dir, f), "utf8"))
  const url = pathToFileURL(join(frontendPackDir, "scripts", "tokens-build.mjs")).href
  const build = (await import(/* @vite-ignore */ url)) as TokensBuild
  return { tokens: read("tokens.json"), map: read("tokens.map.json"), build, brands: MBANK_BRANDS }
}

export const brandSelectors = (brand: string) => ({
  light: `[data-brand="${brand}"]`,
  dark: `.dark[data-brand="${brand}"], .dark [data-brand="${brand}"]`,
})

function keyOf(base: BaseSource, section: string, name: string): string | null {
  const s = base.tokens[section] as { vars?: { name: string; key?: string }[] } | undefined
  return s?.vars?.find((v) => v.name === name)?.key ?? null
}

function sourceOf(base: BaseSource, decl: Decl | undefined, value: string, brand: string): ValueSource {
  const ref = /^var\(--([\w-]+)\)$/.exec(value.trim())
  // A configurator value that differs from the generator (transforms, shadcn slots) is its own.
  if (!decl || decl.value !== value || !decl.src || decl.src.literal) return ref ? { ref: ref[1] } : { literal: true }
  const lib = LIBRARY[decl.src.collection ?? "theme"]
  if (!lib || !decl.src.figma) return { literal: true }
  const mode = decl.src.collection === "brand" ? (decl.src.mode ?? brand) : undefined
  return { alias: { collection: lib.collection, name: decl.src.figma, key: keyOf(base, lib.section, decl.src.figma), ...(mode && { mode }) } }
}

const declIndex = (blocks: Block[], selector: string) => {
  const out = new Map<string, Decl>()
  for (const d of blocks.find((b) => b.selector === selector)?.items ?? []) if (d.prop) out.set(d.prop.slice(2), d)
  return out
}

export function isColorValue(value: string | undefined, vars: ModeVars) {
  const v = value === undefined ? null : resolveVar(value, vars)
  return v !== null && parseCssColor(v) !== null
}

/** Every shadcn token of the base for one brand, in configurator order, with light/dark and provenance. */
export function baseTokens(base: BaseSource, brand: string): BaseToken[] {
  const ds = buildDesignSystem({ ...DEFAULT_STATE, source: "mbank", brand, extras: [] })
  const { blocks } = base.build.buildModel(base.tokens, base.map)
  const sel = brandSelectors(brand)
  const light = { root: declIndex(blocks, ":root"), brand: declIndex(blocks, sel.light) }
  const dark = { root: declIndex(blocks, ".dark"), brand: declIndex(blocks, sel.dark) }
  const scale = declIndex(blocks, "@theme")
  const darkVars = { ...ds.light, ...ds.dark }
  const out: BaseToken[] = []
  for (const name of Object.keys(ds.light)) {
    const kind: TokenKind | null = name === "radius" ? "radius" : isColorValue(ds.light[name], ds.light) ? "color" : null
    if (!kind) continue // z-index, shadow colour: not design tokens of the shadcn collection
    const lightDecl = light.brand.get(name) ?? light.root.get(name)
    const darkDecl = dark.brand.get(name) ?? dark.root.get(name) ?? lightDecl
    out.push({
      name, kind, scope: "root", light: ds.light[name], dark: darkVars[name],
      source: { light: sourceOf(base, lightDecl, ds.light[name], brand), dark: sourceOf(base, darkDecl, darkVars[name], brand) },
    })
  }
  for (const [name, value] of Object.entries(ds.theme)) {
    if (!name.startsWith("radius-")) continue
    const src = sourceOf(base, scale.get(name), value, brand)
    out.push({ name, kind: "radius", scope: "theme", light: value, dark: value, source: { light: src, dark: src } })
  }
  return out
}
