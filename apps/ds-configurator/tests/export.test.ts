import Ajv from "ajv"
import { describe, expect, it } from "vitest"

import { buildDesignSystem, projectDesignSystem } from "@/lib/design-system"
import { buildRegistryItem } from "@/lib/export/registry-item"
import { buildTokensCss } from "@/lib/export/tokens-css"
import { applyOverrides, COLOR_NAMES, RADIUS_SCALE, SHADCN_TOKENS } from "@/lib/tokens"
import { DEFAULT_STATE } from "@/lib/types"
import schema from "@/upstream/registry-item.schema.json"

// Vendored copy of https://ui.shadcn.com/schema/registry-item.json (upstream apps/v4/public/schema).
const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false }) // its $schema is the https draft-07 URL
const validate = ajv.compile(schema)

describe("registry:base export", () => {
  it("the vendored schema validator rejects invalid items", () => {
    expect(validate({ name: "x" })).toBe(false)
    expect(validate({ name: "x", type: "registry:ui", style: "nova" })).toBe(false)
  })

  const systems = [
    buildDesignSystem(DEFAULT_STATE),
    buildDesignSystem({ ...DEFAULT_STATE, baseColor: "stone", theme: "rose", font: "inter", fontHeading: "lora" }),
    projectDesignSystem("credit", applyOverrides(SHADCN_TOKENS, { primary: { light: "#7c3aed" }, "font-sans": { light: "'Inter', sans-serif" } })),
  ]
  for (const ds of systems) {
    it(`is valid against the shadcn registry-item schema (${ds.name})`, () => {
      const ok = validate(JSON.parse(JSON.stringify(buildRegistryItem(ds))))
      expect(validate.errors ?? []).toEqual([])
      expect(ok).toBe(true)
    })
  }

  it("has the registry:base shape the shadcn CLI reads, only shadcn names", () => {
    const item = buildRegistryItem(buildDesignSystem(DEFAULT_STATE))
    expect(item).toMatchObject({
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: "canonical-canonical",
      type: "registry:base",
      extends: "none",
      config: { style: "radix-nova", iconLibrary: "lucide", menuAccent: "subtle", menuColor: "default", tailwind: { baseColor: "canonical" } },
      registryDependencies: ["utils"], // the canonical font is a CSS stack, not a registry font item
      meta: { figma: { collection: "shadcn", modes: ["Light", "Dark"] } },
    })
    expect(item.cssVars.light.primary).toBe(SHADCN_TOKENS.colors.primary.light)
    expect(item.cssVars.dark.border).toBe(SHADCN_TOKENS.colors.border.dark)
    expect(item.cssVars.theme["font-sans"]).toBe(SHADCN_TOKENS.font.sans)
    expect(Object.keys(item.cssVars.dark)).toEqual(COLOR_NAMES)
    expect(item.cssVars.theme["radius-xl"]).toBe(RADIUS_SCALE.xl) // fixed 20px
    const google = buildRegistryItem(systems[1])
    expect(google.registryDependencies).toEqual(["utils", "font-inter", "font-heading-lora"])
  })

  it("a project's free font stack goes to cssVars.theme, no font registry item", () => {
    const item = buildRegistryItem(systems[2])
    expect(item.registryDependencies).toEqual(["utils"])
    expect(item.cssVars.theme["font-sans"]).toBe("'Inter', sans-serif")
    expect(item.cssVars.light.primary).toBe("#7c3aed")
  })
})

describe("tokens.css export", () => {
  it("has :root, .dark, @theme inline mappings for the shadcn names only", () => {
    const css = buildTokensCss(buildDesignSystem(DEFAULT_STATE))
    const { radius, colors } = SHADCN_TOKENS
    expect(css).toContain(`:root {\n  --radius: ${radius};\n  --background: ${colors.background.light};`)
    const dark = css.slice(css.indexOf(".dark {"))
    expect(dark.slice(0, dark.indexOf("}"))).toContain(`--primary: ${colors.primary.dark};`)
    expect(css).toContain("--color-sidebar-ring: var(--sidebar-ring);")
    for (const n of ["success", "success-foreground", "warning", "warning-foreground", "info", "info-foreground"]) {
      expect(css).toContain(`--${n}: ${colors[n].light};`)
      expect(dark).toContain(`--${n}: ${colors[n].dark};`)
      expect(css).toContain(`--color-${n}: var(--${n});`)
    }
    for (const [k, v] of Object.entries(RADIUS_SCALE)) expect(css).toContain(`--radius-${k}: ${v};`)
    expect(css).toContain("--radius-sm: 8px;")
    expect(css).toContain("--font-heading: var(--font-sans);")
    expect(css).not.toContain("--color-radius:")
    expect(css.match(/--color-[\w-]+:/g)).toHaveLength(37)
  })
})

describe("upstream themes", () => {
  it("every base colour + theme gives all colour names as valid colours (status defaults included)", async () => {
    const { BASE_COLORS } = await import("@/upstream/base-colors")
    const { buildRegistryTheme, getThemesForBaseColor } = await import("@/upstream/config")
    const { parseCssColor } = await import("@/lib/color")
    for (const base of BASE_COLORS) {
      for (const theme of getThemesForBaseColor(base.name)) {
        const { light, dark } = buildRegistryTheme({ ...DEFAULT_STATE, baseColor: base.name, theme: theme.name } as Parameters<typeof buildRegistryTheme>[0])
        for (const n of COLOR_NAMES) {
          expect(parseCssColor(light[n]), `${base.name}/${theme.name} light ${n}`).toBeTruthy()
          expect(parseCssColor(dark[n]), `${base.name}/${theme.name} dark ${n}`).toBeTruthy()
        }
      }
    }
  })
})
