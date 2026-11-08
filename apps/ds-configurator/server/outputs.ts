// Generated outputs of a project: tokens.css (frontend-pack tokens-build model + render, patched
// with the project's overrides and custom tokens), the shadcn registry:base item (configurator
// export code) and figma.json, the plan of the `shadcn` variable collection the widget writes.
import { buildDesignSystem } from "@/lib/design-system"
import { buildRegistryItem } from "@/lib/export/registry-item"
import { scopesFor } from "@/lib/figma-scopes"
import { DEFAULT_STATE } from "@/lib/types"

import { brandSelectors, type BaseSource, type Mode, type ValueSource } from "./base"
import type { Resolved, Row } from "./resolve"
import type { Project, TokensDoc } from "./store"

type Decl = { prop?: string; value?: string; src?: unknown; note?: string | null; todo?: string | null; comment?: string; packed?: unknown }
type Block = { selector: string; items: Decl[] }

const OVERRIDE = { literal: true }

function setDecl(blocks: Block[], selectors: string[], name: string, value: string) {
  let hit = false
  for (const b of blocks.filter((x) => selectors.includes(x.selector))) {
    for (const d of b.items) {
      if (d.prop !== `--${name}`) continue
      Object.assign(d, { value, src: OVERRIDE, note: "project override", todo: null })
      hit = true
    }
  }
  return hit
}

const block = (blocks: Block[], selector: string) => {
  const b = blocks.find((x) => x.selector === selector)
  if (!b) throw new Error(`tokens-build model has no block ${selector}`)
  return b
}

function setUtility(inline: Block, prop: string, value: string) {
  const d = inline.items.find((x) => x.prop === prop)
  if (d) Object.assign(d, { value, src: OVERRIDE, note: null })
  else inline.items.push({ prop, value, src: OVERRIDE })
}

/** tokens.css of the project: the same generator as frontend-pack tokens.css, one model patched. */
export function tokensCss(source: BaseSource, project: Project, doc: TokensDoc, resolved: Resolved) {
  const model = source.build.buildModel(source.tokens, source.map) as { blocks: Block[] }
  const blocks = model.blocks
  const sel = brandSelectors(doc.brand)
  const inline = block(blocks, "@theme inline")
  for (const [name, o] of Object.entries(doc.overrides)) {
    const row = resolved.rows.find((r) => r.name === name)
    if (row?.scope === "theme") {
      if (o.light !== undefined) setDecl(blocks, ["@theme"], name, o.light)
      continue
    }
    for (const mode of ["light", "dark"] as const) {
      const value = o[mode]
      if (value === undefined) continue
      const selectors = mode === "light" ? [":root", sel.light] : [".dark", sel.dark]
      if (!setDecl(blocks, selectors, name, value)) {
        // A shadcn slot Mbank keeps as an @theme alias (ring, popover…): becomes a real var.
        block(blocks, mode === "light" ? ":root" : ".dark").items.push({ prop: `--${name}`, value, src: OVERRIDE, note: "project override" })
        if (row?.kind === "color") setUtility(inline, `--color-${name}`, `var(--${name})`)
      }
    }
  }
  if (doc.custom.length) {
    const root = block(blocks, ":root")
    const dark = block(blocks, ".dark")
    root.items.push({ comment: `Project tokens (${project.id})` })
    for (const t of doc.custom) {
      root.items.push({ prop: `--${t.name}`, value: t.light, src: OVERRIDE, note: `custom ${t.kind}` })
      if (t.kind === "color" || t.dark !== t.light) dark.items.push({ prop: `--${t.name}`, value: t.dark, src: OVERRIDE })
      const short = t.name.slice(doc.prefix.length + 1) || t.name
      const prop = t.kind === "color" ? `--color-${t.name}` : t.kind === "radius" ? `--radius-${short}` : `--spacing-${short}`
      setUtility(inline, prop, `var(--${t.name})`)
    }
  }
  const map = source.map as { header: string[] }
  const header = [
    `Project "${project.name}" (${project.id}), version ${doc.version}, brand ${doc.brand}: apps/ds-configurator.`,
    "Base: frontend-pack Mbank tokens; project overrides and custom tokens are marked. Do not edit by hand.",
    "",
    ...map.header,
  ]
  return source.build.render(model, { ...map, header }, source.tokens)
}

/** shadcn registry:base item, built by the configurator's export code from the project values. */
export function registryItem(project: Project, doc: TokensDoc, resolved: Resolved) {
  const ds = buildDesignSystem({ ...DEFAULT_STATE, source: "mbank", brand: doc.brand, prefix: doc.prefix, extras: doc.custom })
  ds.name = project.id
  for (const [name, o] of Object.entries(doc.overrides)) {
    const row = resolved.rows.find((r) => r.name === name)
    if (row?.scope === "theme") {
      if (o.light !== undefined) ds.theme[name] = o.light
      continue
    }
    if (o.light !== undefined) ds.light[name] = o.light
    if (o.dark !== undefined) ds.dark[name] = o.dark
  }
  const item = buildRegistryItem(ds)
  return {
    ...item,
    title: project.name,
    description: `${project.name}: Mbank (${doc.brand}) shadcn/ui design system, version ${doc.version}`,
    meta: { ...item.meta, project: project.id, version: doc.version, figma: { collection: "shadcn", modes: ["light", "dark"] } },
  }
}

export type PlanValue = { value: string | number | null; alias?: { collection: string; name: string; key: string | null; mode?: string }; ref?: string }
export type PlanVariable = {
  name: string
  kind: Row["kind"]
  type: "COLOR" | "FLOAT"
  scopes: string[]
  codeSyntax: string
  custom: boolean
  overridden: boolean
  pairWith?: string
  values: Record<Mode, PlanValue>
  base: Record<Mode, PlanValue> | null
}

const refOf = (v: string) => /^var\(--([\w-]+)\)$/.exec(v.trim())?.[1]

function planValue(raw: string, resolved: string | number | null, src: ValueSource | null): PlanValue {
  if (src && "alias" in src) return { value: resolved, alias: src.alias }
  const ref = refOf(raw)
  return ref ? { value: resolved, ref } : { value: resolved }
}

const scopes = (r: Row) => (r.kind === "radius" ? ["CORNER_RADIUS"] : r.kind === "size" ? ["WIDTH_HEIGHT", "GAP"] : scopesFor(r.name))

/** figma.json: the `shadcn` collection (modes light, dark), aliases to Foundation where the value is Mbank's. */
export function figmaPlan(project: Project, doc: TokensDoc, resolved: Resolved) {
  const variables: PlanVariable[] = resolved.rows.map((r) => {
    const base = r.base
    const value = (mode: Mode) => planValue(r[mode], r.resolved[mode], base && !r.overridden[mode] ? base.source[mode] : null)
    return {
      name: r.name, kind: r.kind, type: r.kind === "color" ? "COLOR" : "FLOAT", scopes: scopes(r), codeSyntax: `var(--${r.name})`,
      custom: r.custom, overridden: r.overridden.light || r.overridden.dark, ...(r.pairWith && { pairWith: r.pairWith }),
      values: { light: value("light"), dark: value("dark") },
      base: base ? {
        light: planValue(base.light, base.resolved.light, base.source.light),
        dark: planValue(base.dark, base.resolved.dark, base.source.dark),
      } : null,
    }
  })
  return {
    $schema: "ds-configurator/figma-plan@1",
    project: project.id,
    name: project.name,
    version: doc.version,
    brand: doc.brand,
    prefix: doc.prefix,
    collection: "shadcn",
    modes: ["light", "dark"],
    variables,
  }
}
