// Forked from shadcn-ui/ui apps/v4/registry/config.ts (MIT), see NOTICE.md.
// Kept: RADII, MENU_ACCENTS, MENU_COLORS, POINTER_CURSOR_SELECTOR, getThemesForBaseColor,
// buildRegistryTheme and buildRegistryBase. Changes: no zod schema / Next fonts; the theme
// transforms (menu accent, radius) are split out so the Mbank preset goes through the same code;
// buildRegistryBase takes the already merged cssVars and a name, and always uses the Radix base
// (the Mbank kit is built on radix-ui).
import { BASE_COLORS } from "./base-colors"
import { FONT_DEFINITIONS } from "./font-definitions"
import { iconLibraries, type IconLibraryName } from "./icon-libraries"
import { type PresetConfig } from "./preset"
import { THEMES } from "./themes"
import { type CssVars } from "./types"

const SHADCN_VERSION = "latest"

export const POINTER_CURSOR_SELECTOR =
  'button:not(:disabled), [role="button"]:not(:disabled)'

export const MENU_ACCENTS = [
  { value: "subtle", label: "Subtle" },
  { value: "bold", label: "Bold" },
] as const

export const MENU_COLORS = [
  { value: "default", label: "Default" },
  { value: "inverted", label: "Inverted" },
  { value: "default-translucent", label: "Default Translucent" },
  { value: "inverted-translucent", label: "Inverted Translucent" },
] as const

export const RADII = [
  { name: "default", label: "Default", value: "" },
  { name: "none", label: "None", value: "0" },
  { name: "small", label: "Small", value: "0.45rem" },
  { name: "medium", label: "Medium", value: "0.625rem" },
  { name: "large", label: "Large", value: "0.875rem" },
] as const

export type ThemeVars = Record<string, string>

export function getThemesForBaseColor(baseColorName: string) {
  const baseColorNames = BASE_COLORS.map((bc) => bc.name)
  return THEMES.filter((theme) => {
    if (theme.name === baseColorName) return true
    return !baseColorNames.includes(theme.name)
  })
}

export const getTheme = (name: string) => THEMES.find((t) => t.name === name)
export const getBaseColor = (name: string) => BASE_COLORS.find((c) => c.name === name)

// Upstream create/components/radius-picker.tsx: Lyra and Sera lock the radius to "none".
export function effectiveRadius(style: string, radius: PresetConfig["radius"]) {
  return style === "lyra" || style === "sera" ? "none" : radius
}

/** Chart colours of another theme replace chart-1..5 (upstream buildRegistryTheme). */
export function applyChartColor(light: ThemeVars, dark: ThemeVars, chartColor?: string) {
  const chartTheme = chartColor ? getTheme(chartColor) : undefined
  if (!chartTheme) return
  for (let i = 1; i <= 5; i++) {
    const key = `chart-${i}`
    if (chartTheme.cssVars?.light?.[key]) light[key] = chartTheme.cssVars.light[key]
    if (chartTheme.cssVars?.dark?.[key]) dark[key] = chartTheme.cssVars.dark[key]
  }
}

/** Menu accent and radius transforms (upstream buildRegistryTheme). Mutates the maps. */
export function applyTransforms(
  light: ThemeVars,
  dark: ThemeVars,
  config: Pick<PresetConfig, "menuAccent" | "radius" | "style">
) {
  if (config.menuAccent === "bold") {
    light.accent = light.primary
    light["accent-foreground"] = light["primary-foreground"]
    dark.accent = dark.primary
    dark["accent-foreground"] = dark["primary-foreground"]
  }
  const radiusName = effectiveRadius(config.style, config.radius)
  if (radiusName && radiusName !== "default") {
    const radius = RADII.find((r) => r.name === radiusName)
    if (radius && radius.value) light.radius = radius.value
  }
}

// Builds the cssVars of a registry:theme item from a base colour + theme (upstream).
export function buildRegistryTheme(config: PresetConfig) {
  const baseColor = getBaseColor(config.baseColor)
  const theme = getTheme(config.theme)
  if (!baseColor || !theme) {
    throw new Error(`Base color "${config.baseColor}" or theme "${config.theme}" not found`)
  }
  const light: ThemeVars = { ...baseColor.cssVars?.light, ...theme.cssVars?.light }
  const dark: ThemeVars = { ...baseColor.cssVars?.dark, ...theme.cssVars?.dark }
  applyChartColor(light, dark, config.chartColor ?? config.theme)
  applyTransforms(light, dark, config)
  return { light, dark }
}

export function getFontDefinition(font: string) {
  return FONT_DEFINITIONS.find((f) => f.name === font)
}

type RegistryBaseInput = {
  name: string
  config: PresetConfig
  cssVars: Required<CssVars>
  fontRegistryDependency: boolean
  pointer?: boolean
}

// registry:base item (upstream buildRegistryBase), cssVars already merged by the caller.
export function buildRegistryBase({ name, config, cssVars, fontRegistryDependency, pointer }: RegistryBaseInput) {
  const iconLibrary = iconLibraries[config.iconLibrary as IconLibraryName]
  const fontHeading = config.fontHeading === config.font ? "inherit" : config.fontHeading
  const dependencies = [
    `shadcn@${SHADCN_VERSION}`,
    "class-variance-authority",
    "tw-animate-css",
    "radix-ui",
    ...iconLibrary.packages,
  ]
  const registryDependencies = ["utils"]
  if (fontRegistryDependency) registryDependencies.push(`font-${config.font}`)
  if (fontRegistryDependency && fontHeading !== "inherit") registryDependencies.push(`font-heading-${fontHeading}`)

  return {
    name,
    extends: "none",
    type: "registry:base" as const,
    config: {
      style: `radix-${config.style}`,
      iconLibrary: iconLibrary.name,
      rtl: false,
      menuColor: config.menuColor,
      menuAccent: config.menuAccent,
      tailwind: { baseColor: config.baseColor },
    },
    dependencies,
    registryDependencies,
    cssVars,
    css: {
      '@import "tw-animate-css"': {},
      '@import "shadcn/tailwind.css"': {},
      "@layer base": {
        "*": { "@apply border-border outline-ring/50": {} },
        body: { "@apply bg-background text-foreground": {} },
        ...(pointer && { [POINTER_CURSOR_SELECTOR]: { cursor: "pointer" } }),
      },
    },
  }
}
