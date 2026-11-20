// The token model: the app's copy equals the canonical file, defaults, overrides, radius scale,
// configurator state -> only the canonical names, contrast pairs.
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import copy from "@/data/shadcn-tokens.json"
import { contrastChecks, CONTRAST_PAIRS } from "@/lib/contrast"
import { buildDesignSystem, stateValues } from "@/lib/design-system"
import { applyOverrides, COLOR_NAMES, colorHex, EDITABLE, fontFamily, RADIUS_SCALE, radiusPx, SHADCN_TOKENS, toPx } from "@/lib/tokens"
import { stateFromSearch, stateToSearch } from "@/lib/share"
import { DEFAULT_STATE } from "@/lib/types"

const OWNER = join(__dirname, "..", "..", "..", "plugins", "figma-pack", "skills", "ds-tokens", "references", "shadcn-tokens.json")

describe("shadcn token set", () => {
  it.runIf(existsSync(OWNER))("src/data copy equals the canonical file (figma-pack ds-tokens)", () => {
    const { $copy, ...rest } = copy as Record<string, unknown>
    expect($copy).toContain("figma-pack")
    expect(rest).toEqual(JSON.parse(readFileSync(OWNER, "utf8")))
  })

  it("37 colours + radius + two fonts are the only editable names", () => {
    expect(COLOR_NAMES).toHaveLength(37)
    expect(EDITABLE.size).toBe(40)
    for (const n of ["success", "success-foreground", "warning", "warning-foreground", "info", "info-foreground"]) expect(COLOR_NAMES).toContain(n)
    expect([...EDITABLE.keys()].filter((n) => !COLOR_NAMES.includes(n))).toEqual(["radius", "font-sans", "font-heading"])
  })

  it("overrides change values only; fixed radius steps stay, formula steps follow --radius", () => {
    const v = applyOverrides(SHADCN_TOKENS, { primary: { light: "#7c3aed" }, radius: { light: "8px" }, nope: { light: "#000" } })
    expect(v.colors.primary).toEqual({ light: "#7c3aed", dark: SHADCN_TOKENS.colors.primary.dark })
    expect(Object.keys(v.colors)).toEqual(COLOR_NAMES)
    // Canonical scale: fixed Figma lengths (sm 8px .. 4xl 40px), independent of --radius.
    const fixed = Object.fromEntries(Object.entries(RADIUS_SCALE).map(([k, s]) => [`radius-${k}`, toPx(s)]))
    expect(radiusPx(SHADCN_TOKENS)).toEqual({ radius: 12, ...fixed })
    expect(radiusPx(SHADCN_TOKENS)).toMatchObject({ "radius-sm": 8, "radius-lg": 16, "radius-4xl": 40 })
    expect(radiusPx(v)).toEqual({ radius: 8, ...fixed })
    // A formula scale (shadcn init) still derives from --radius; unparseable --radius -> null, fixed steps unaffected.
    const formula = { sm: "calc(var(--radius) * 0.6)", lg: "var(--radius)", xl: "calc(var(--radius) * 1.4)", fixed: "1rem" }
    expect(radiusPx(v, formula)).toEqual({ radius: 8, "radius-sm": 4.8, "radius-lg": 8, "radius-xl": 11.2, "radius-fixed": 16 })
    expect(radiusPx({ ...v, radius: "var(--x)" }, formula)).toEqual({ radius: null, "radius-sm": null, "radius-lg": null, "radius-xl": null, "radius-fixed": 16 })
    expect(colorHex(SHADCN_TOKENS, "background", "light")).toBe("#ffffff")
    expect(colorHex(SHADCN_TOKENS, "border", "dark")).toBe("#3a3c41") // canonical borders are opaque
    expect(colorHex(applyOverrides(SHADCN_TOKENS, { border: { dark: "oklch(1 0 0 / 10%)" } }), "border", "dark")).toBe("#ffffff1a")
    expect(fontFamily(SHADCN_TOKENS.font.sans)).toBe("Inter Mbank")
  })

  it("the configurator default equals the canonical values", () => {
    const v = stateValues(DEFAULT_STATE)
    expect(v.colors).toEqual(SHADCN_TOKENS.colors)
    expect(v.radius).toBe(SHADCN_TOKENS.radius)
    expect(v.font).toEqual(SHADCN_TOKENS.font)
    expect(stateFromSearch(stateToSearch(DEFAULT_STATE))).toEqual(DEFAULT_STATE) // survives the ?preset= code
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
    for (const s of ["success", "warning", "info"]) expect(CONTRAST_PAIRS).toContainEqual([`${s}-foreground`, s])
    const checks = contrastChecks(SHADCN_TOKENS)
    expect(checks.find((c) => c.fg === "primary-foreground" && c.mode === "light")?.ok).toBe(true)
    const bad = contrastChecks(applyOverrides(SHADCN_TOKENS, { "primary-foreground": { light: "#ffffff" } })) // white on yellow
    expect(bad.find((c) => c.fg === "primary-foreground" && c.mode === "light")?.ok).toBe(false)
  })
})

describe("oklch -> hex", () => {
  it("clips per channel like browsers and Tailwind (out-of-gamut red)", () => {
    // shadcn neutral destructive, outside sRGB: per-channel clipping gives Tailwind's red-600 #e7000b.
    expect(colorHex(applyOverrides(SHADCN_TOKENS, { destructive: { light: "oklch(0.577 0.245 27.325)" } }), "destructive", "light")).toBe("#e7000b")
    expect(colorHex(SHADCN_TOKENS, "primary", "light")).toBe("#fddb2b") // Mbank yellow
  })
})
