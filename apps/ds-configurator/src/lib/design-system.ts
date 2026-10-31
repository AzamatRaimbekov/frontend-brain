// Configurator state -> resolved design system (light/dark/theme vars). Every exporter and the
// live preview read this, so code, tokens.css and Figma get the same values.
import {
  applyChartColor,
  applyTransforms,
  buildRegistryTheme,
  getFontDefinition,
} from "@/upstream/config"

import { toPx } from "./extra-tokens"
import { MBANK, MBANK_FONT_STACK, mbankVars } from "./mbank"
import type { ConfiguratorState, DesignSystem, ModeVars } from "./types"

function fontVars(state: ConfiguratorState): ModeVars {
  const body = getFontDefinition(state.font)
  const sans = state.source === "mbank" && state.font === "inter" ? MBANK_FONT_STACK : body?.family
  const heading = state.fontHeading === "inherit" || state.fontHeading === state.font
    ? "var(--font-sans)"
    : getFontDefinition(state.fontHeading)?.family
  return { ...(sans && { "font-sans": sans }), ...(heading && { "font-heading": heading }) }
}

// Mbank controls use radius-md = --radius (12px) with sm/lg/xl 4px apart. When the upstream radius
// option overrides --radius, the scale follows it as px, so Figma gets plain numbers too.
function mbankRadiusScale(radius: string): ModeVars {
  const r = toPx(radius)
  const px = (n: number) => `${Math.max(0, n)}px`
  return { "radius-sm": px(r - 4), "radius-md": px(r), "radius-lg": px(r + 4), "radius-xl": px(r + 8) }
}

function addExtras(state: ConfiguratorState, light: ModeVars, dark: ModeVars, theme: ModeVars) {
  for (const token of state.extras) {
    light[token.name] = token.light
    if (token.kind === "color" || token.dark !== token.light) dark[token.name] = token.dark
    const short = token.name.slice(state.prefix.length + 1) || token.name
    if (token.kind === "radius") theme[`radius-${short}`] = `var(--${token.name})`
    if (token.kind === "size") theme[`spacing-${short}`] = `var(--${token.name})`
  }
}

export function designSystemName(state: ConfiguratorState) {
  return state.source === "mbank" ? `mbank-${state.brand}` : `${state.baseColor}-${state.theme}`
}

export function buildDesignSystem(state: ConfiguratorState): DesignSystem {
  let light: ModeVars
  let dark: ModeVars
  let theme: ModeVars = {}
  if (state.source === "mbank") {
    const vars = mbankVars(state.brand)
    ;({ light, dark, theme } = vars)
    applyChartColor(light, dark, state.chartColor)
    applyTransforms(light, dark, state)
    if (light.radius !== MBANK.light.radius) Object.assign(theme, mbankRadiusScale(light.radius))
  } else {
    ;({ light, dark } = buildRegistryTheme(state))
  }
  theme = { ...theme, ...fontVars(state) }
  addExtras(state, light, dark, theme)
  return {
    name: designSystemName(state),
    light,
    dark,
    theme,
    figma: state.source === "mbank" ? MBANK.figma : {},
    state,
  }
}

/** Var names the design system already defines (extras must not reuse them). */
export function baseTokenNames(state: ConfiguratorState) {
  const ds = buildDesignSystem({ ...state, extras: [] })
  return new Set([...Object.keys(ds.light), ...Object.keys(ds.dark)])
}
