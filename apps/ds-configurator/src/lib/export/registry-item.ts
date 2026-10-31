// shadcn registry item of type registry:base (the whole design system), valid against
// https://ui.shadcn.com/schema/registry-item.json. Built by the forked upstream buildRegistryBase.
import { buildRegistryBase } from "@/upstream/config"
import { encodePreset } from "@/upstream/preset"

import type { DesignSystem } from "../types"

export const REGISTRY_ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json"

export function buildRegistryItem(ds: DesignSystem) {
  const s = ds.state
  const mbank = s.source === "mbank"
  const base = buildRegistryBase({
    name: ds.name,
    config: s,
    cssVars: { theme: ds.theme, light: ds.light, dark: ds.dark },
    // Inter Mbank is not on Google Fonts yet: the Mbank stack goes in cssVars.theme, no font item.
    fontRegistryDependency: !(mbank && s.font === "inter"),
  })
  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    ...base,
    title: mbank ? `Mbank ${s.brand}` : `${s.baseColor} / ${s.theme}`,
    description: mbank
      ? `Mbank design system, brand ${s.brand}: Figma tokens (2.theme + 1.brand) for shadcn/ui + Tailwind v4`
      : `shadcn/ui design system: base colour ${s.baseColor}, theme ${s.theme}`,
    meta: {
      generator: "apps/ds-configurator",
      source: s.source,
      brand: mbank ? s.brand : undefined,
      preset: encodePreset(s),
      figma: { collection: "Brand", mode: mbank ? s.brand : ds.name },
      extras: s.extras.map((t) => t.name),
    },
  }
}

export const registryItemJson = (ds: DesignSystem) => `${JSON.stringify(buildRegistryItem(ds), null, 2)}\n`
