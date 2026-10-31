// Picker definitions for the customizer, in the order of upstream create/components/customizer.tsx
// (style, base colour, theme, chart colour, heading, font, icon library, radius, menu colour, accent),
// with our Source and Brand pickers in front.
import { BASE_COLORS } from "@/upstream/base-colors"
import { getThemesForBaseColor, MENU_ACCENTS, MENU_COLORS, RADII } from "@/upstream/config"
import { FONT_DEFINITIONS } from "@/upstream/font-definitions"
import { iconLibraries } from "@/upstream/icon-libraries"
import { STYLES } from "@/upstream/styles"
import { THEMES } from "@/upstream/themes"

import { MBANK } from "./mbank"
import type { ConfiguratorState } from "./types"

export type PickerOption = { value: string; label: string; description?: string; swatch?: string; disabled?: boolean }
export type PickerKey = "source" | "brand" | "style" | "baseColor" | "theme" | "chartColor" | "fontHeading" | "font" | "iconLibrary" | "radius" | "menuColor" | "menuAccent"
export type PickerSpec = { key: PickerKey; label: string; options: PickerOption[]; disabled?: boolean; separatorBefore?: boolean }

/** chartColor undefined = the source's own charts. */
export const SOURCE_CHARTS = "source"

const themeOption = (t: (typeof THEMES)[number], swatchKey = "primary") => ({
  value: t.name,
  label: t.title ?? t.name,
  swatch: t.cssVars?.light?.[swatchKey],
})

export function pickerValue(state: ConfiguratorState, key: PickerKey) {
  return key === "chartColor" ? (state.chartColor ?? SOURCE_CHARTS) : String(state[key])
}

export function pickerPatch(key: PickerKey, value: string): Partial<ConfiguratorState> {
  if (key === "chartColor") return { chartColor: value === SOURCE_CHARTS ? undefined : (value as ConfiguratorState["chartColor"]) }
  return { [key]: value } as Partial<ConfiguratorState>
}

export function pickerSpecs(state: ConfiguratorState): PickerSpec[] {
  const mbank = state.source === "mbank"
  const radiusLocked = state.style === "lyra" || state.style === "sera"
  const fonts = FONT_DEFINITIONS.map((f) => ({ value: f.name, label: f.title, description: f.type }))
  const specs: PickerSpec[] = [
    {
      key: "source",
      label: "Источник токенов",
      options: [
        { value: "mbank", label: "Mbank (Figma)", description: "2.theme + 1.brand из frontend-pack" },
        { value: "shadcn", label: "shadcn", description: "базовый цвет + тема upstream" },
      ],
    },
    mbank
      ? { key: "brand", label: "Бренд", options: MBANK.brands.map((b) => ({ value: b, label: b, swatch: MBANK.brandLight[b].brand })) }
      : { key: "baseColor", label: "Base Color", options: BASE_COLORS.map((t) => themeOption(t, "muted-foreground")) },
    { key: "style", label: "Style", separatorBefore: true, options: STYLES.map((s) => ({ value: s.name, label: s.title, description: s.description })) },
  ]
  if (!mbank) specs.push({ key: "theme", label: "Theme", options: getThemesForBaseColor(state.baseColor).map((t) => themeOption(t)) })
  specs.push(
    {
      key: "chartColor",
      label: "Chart Color",
      options: [{ value: SOURCE_CHARTS, label: mbank ? "Mbank supportive" : "Как в теме" }, ...THEMES.map((t) => themeOption(t, "chart-3"))],
    },
    { key: "fontHeading", label: "Heading", separatorBefore: true, options: [{ value: "inherit", label: "Inherit" }, ...fonts] },
    { key: "font", label: "Font", options: fonts.map((f) => (mbank && f.value === "inter" ? { ...f, label: "Inter Mbank" } : f)) },
    {
      key: "iconLibrary",
      label: "Icon Library",
      separatorBefore: true,
      options: Object.values(iconLibraries).map((l) => ({ value: l.name, label: l.title })),
    },
    {
      key: "radius",
      label: "Radius",
      disabled: radiusLocked,
      options: RADII.map((r) => ({
        value: r.name,
        label: r.name === "default" && mbank ? "Default (Mbank 12px)" : r.label,
        disabled: state.style === "rhea" && r.name === "large",
      })),
    },
    { key: "menuColor", label: "Menu", separatorBefore: true, options: MENU_COLORS.map((m) => ({ value: m.value, label: m.label })) },
    { key: "menuAccent", label: "Menu Accent", options: MENU_ACCENTS.map((m) => ({ value: m.value, label: m.label })) },
  )
  return specs
}
