// The token model: the app's copy equals the canonical file, defaults, overrides, derived radius,
// configurator state -> only the canonical names, contrast pairs.
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import copy from "@/data/shadcn-tokens.json"
import { contrastChecks, CONTRAST_PAIRS } from "@/lib/contrast"
import { buildDesignSystem, stateValues } from "@/lib/design-system"
import { applyOverrides, COLOR_NAMES, colorHex, EDITABLE, fontFamily, radiusPx, SHADCN_TOKENS } from "@/lib/tokens"
import { DEFAULT_STATE } from "@/lib/types"

const OWNER = join(__dirname, "..", "..", "..", "plugins", "figma-pack", "skills", "ds-tokens", "references", "shadcn-tokens.json")

describe("shadcn token set", () => {
  it.runIf(existsSync(OWNER))("src/data copy equals the canonical file (figma-pack ds-tokens)", () => {
    const { $copy, ...rest } = copy as Record<string, unknown>
    expect($copy).toContain("figma-pack")
    expect(rest).toEqual(JSON.parse(readFileSync(OWNER, "utf8")))
  })

  it("31 colours + radius + two fonts are the only editable names", () => {
    expect(COLOR_NAMES).toHaveLength(31)
    expect(EDITABLE.size).toBe(34)
    expect([...EDITABLE.keys()].filter((n) => !COLOR_NAMES.includes(n))).toEqual(["radius", "font-sans", "font-heading"])
  })

  it("overrides change values only; derived radius follows --radius", () => {
    const v = applyOverrides(SHADCN_TOKENS, { primary: { light: "#7c3aed" }, radius: { light: "8px" }, nope: { light: "#000" } })
    expect(v.colors.primary).toEqual({ light: "#7c3aed", dark: "oklch(0.922 0 0)" })
    expect(Object.keys(v.colors)).toEqual(COLOR_NAMES)
    expect(radiusPx(SHADCN_TOKENS)).toMatchObject({ radius: 10, "radius-sm": 6, "radius-md": 8, "radius-lg": 10, "radius-xl": 14, "radius-4xl": 26 })
    expect(radiusPx(v)["radius-sm"]).toBe(4.8)
    expect(colorHex(SHADCN_TOKENS, "background", "light")).toBe("#ffffff")
    expect(colorHex(SHADCN_TOKENS, "border", "dark")).toBe("#ffffff1a")
    expect(fontFamily(SHADCN_TOKENS.font.sans)).toBe("Geist")
  })

  it("the configurator default equals the canonical values", () => {
    const v = stateValues(DEFAULT_STATE)
    expect(v.colors).toEqual(SHADCN_TOKENS.colors)
    expect(v.radius).toBe(SHADCN_TOKENS.radius)
    expect(v.font).toEqual(SHADCN_TOKENS.font)
  })

  it("other /create options stay within the canonical names", () => {
    const ds = buildDesignSystem({ ...DEFAULT_STATE, baseColor: "stone", theme: "rose", radius: "large", menuAccent: "bold" })
    expect(Object.keys(ds.dark).sort()).toEqual([...COLOR_NAMES].sort())
    expect(Object.keys(ds.light).sort()).toEqual([...COLOR_NAMES, "radius"].sort())
    expect(Object.keys(ds.theme).sort()).toEqual(["font-heading", "font-sans", "radius-2xl", "radius-3xl", "radius-4xl", "radius-lg", "radius-md", "radius-sm", "radius-xl"])
    expect(ds.light.radius).toBe("0.875rem")
    expect(ds.light.accent).toBe(ds.light.primary) // bold menu accent
  })

  it("contrast: X-foreground on X and foreground on background, both modes", () => {
    expect(CONTRAST_PAIRS).toContainEqual(["foreground", "background"])
    expect(CONTRAST_PAIRS).toContainEqual(["sidebar-primary-foreground", "sidebar-primary"])
    const checks = contrastChecks(SHADCN_TOKENS)
    expect(checks.find((c) => c.fg === "primary-foreground" && c.mode === "light")?.ok).toBe(true)
    const bad = contrastChecks(applyOverrides(SHADCN_TOKENS, { "primary-foreground": { light: "#222222" } }))
    expect(bad.find((c) => c.fg === "primary-foreground" && c.mode === "light")?.ok).toBe(false)
  })
})

describe("oklch -> hex", () => {
  it("clips per channel like browsers and Tailwind (out-of-gamut destructive)", () => {
    expect(colorHex(SHADCN_TOKENS, "destructive", "light")).toBe("#e7000b")
    expect(colorHex(SHADCN_TOKENS, "primary", "light")).toBe("#171717")
  })
})
