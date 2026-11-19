// figma.json: the plan of the Figma variable collection `shadcn` (modes Light, Dark). Variables are
// named as the CSS tokens and carry raw values (#hex colour, px number, font family) - no aliases to
// other libraries. The site serves it per project; the configurator's use_figma script writes it.
import { scopesFor } from "../figma-scopes"
import { COLOR_NAMES, colorHex, EDITABLE, fontFamily, radiusPx, RADIUS_SCALE, valueOf, type Mode, type TokenKind, type TokenValues } from "../tokens"

export const FIGMA_COLLECTION = "shadcn"
export const FIGMA_MODES = ["Light", "Dark"] as const
export const FIGMA_PLAN_SCHEMA = "ds-configurator/figma-plan@2"

/** value: #hex | px | family; css: the CSS value; ref: the CSS value is var(--ref). */
export type PlanValue = { value: string | number | null; css: string; ref?: string }
export type PlanVariable = {
  name: string
  kind: TokenKind
  type: "COLOR" | "FLOAT" | "STRING"
  scopes: string[]
  codeSyntax: string
  editable: boolean
  derived?: true
  overridden: boolean
  values: Record<Mode, PlanValue>
  base: Record<Mode, PlanValue>
}
export type FigmaPlan = {
  $schema: typeof FIGMA_PLAN_SCHEMA
  project: string
  name: string
  version: number
  collection: typeof FIGMA_COLLECTION
  modes: string[]
  variables: PlanVariable[]
}

const refOf = (css: string) => /^var\(--([\w-]+)\)$/.exec(css.trim())?.[1]

function planValue(values: TokenValues, name: string, kind: TokenKind, mode: Mode): PlanValue {
  const css = name.startsWith("radius-") ? RADIUS_SCALE[name.slice("radius-".length)] : valueOf(values, name, mode)
  const ref = refOf(css)
  let value: string | number | null
  if (kind === "color") value = colorHex(values, name, mode)
  else if (kind === "radius") value = radiusPx(values)[name] ?? null
  else value = fontFamily(ref === "font-sans" ? values.font.sans : css) || null
  return { value, css, ...(ref && { ref }) }
}

function variable(name: string, kind: TokenKind, values: TokenValues, base: TokenValues, derived = false): PlanVariable {
  const vals = (v: TokenValues) => ({ light: planValue(v, name, kind, "light"), dark: planValue(v, name, kind, kind === "color" ? "dark" : "light") })
  const values_ = vals(values)
  const base_ = vals(base)
  return {
    name,
    kind,
    type: kind === "color" ? "COLOR" : kind === "radius" ? "FLOAT" : "STRING",
    scopes: kind === "color" ? scopesFor(name) : kind === "radius" ? ["CORNER_RADIUS"] : ["FONT_FAMILY"],
    codeSyntax: `var(--${name})`,
    editable: !derived,
    ...(derived && { derived: true as const }),
    overridden: values_.light.css !== base_.light.css || values_.dark.css !== base_.dark.css,
    values: values_,
    base: base_,
  }
}

export function buildFigmaPlan(meta: { project: string; name: string; version: number }, values: TokenValues, base: TokenValues): FigmaPlan {
  const variables = [
    ...COLOR_NAMES.map((n) => variable(n, "color", values, base)),
    variable("radius", "radius", values, base),
    ...Object.keys(RADIUS_SCALE).map((k) => variable(`radius-${k}`, "radius", values, base, true)),
    variable("font-sans", "font", values, base),
    variable("font-heading", "font", values, base),
  ]
  if (variables.some((v) => !v.derived && !EDITABLE.has(v.name))) throw new Error("figma plan: non-shadcn token")
  return { $schema: FIGMA_PLAN_SCHEMA, ...meta, collection: FIGMA_COLLECTION, modes: [...FIGMA_MODES], variables }
}
