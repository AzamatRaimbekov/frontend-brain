import Ajv from "ajv"
import { describe, expect, it } from "vitest"

import { buildDesignSystem } from "@/lib/design-system"
import { buildRegistryItem } from "@/lib/export/registry-item"
import { buildTokensCss } from "@/lib/export/tokens-css"
import { DEFAULT_STATE, type ConfiguratorState } from "@/lib/types"
import schema from "@/upstream/registry-item.schema.json"

// Vendored copy of https://ui.shadcn.com/schema/registry-item.json (upstream apps/v4/public/schema).
const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false }) // its $schema is the https draft-07 URL
const validate = ajv.compile(schema)

const extras: ConfiguratorState["extras"] = [
  { name: "mb-promo", kind: "color", light: "#16a34a", dark: "#189547" },
  { name: "mb-card", kind: "radius", light: "20px", dark: "20px" },
  { name: "mb-gutter", kind: "size", light: "1.5rem", dark: "1.5rem" },
]

describe("registry:base export", () => {
  it("the vendored schema validator rejects invalid items", () => {
    expect(validate({ name: "x" })).toBe(false)
    expect(validate({ name: "x", type: "registry:ui", style: "nova" })).toBe(false)
    expect(validate({ name: "x", type: "registry:base", cssVars: { light: { a: 1 } } })).toBe(false)
  })

  for (const over of [{}, { brand: "koko", extras }, { source: "shadcn" as const, baseColor: "stone" as const, theme: "rose" as const }]) {
    it(`is valid against the shadcn registry-item schema (${JSON.stringify(over).slice(0, 40)})`, () => {
      const item = buildRegistryItem(buildDesignSystem({ ...DEFAULT_STATE, ...over }))
      const ok = validate(JSON.parse(JSON.stringify(item)))
      expect(validate.errors ?? []).toEqual([])
      expect(ok).toBe(true)
    })
  }

  it("has the registry:base shape the shadcn CLI reads", () => {
    const item = buildRegistryItem(buildDesignSystem({ ...DEFAULT_STATE, extras }))
    expect(item).toMatchObject({
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: "mbank-bank",
      type: "registry:base",
      extends: "none",
      config: { style: "radix-nova", iconLibrary: "lucide", menuAccent: "subtle", menuColor: "default" },
      registryDependencies: ["utils"],
    })
    expect(item.dependencies).toContain("radix-ui")
    expect(item.cssVars.light.primary).toBe("#fddb2b")
    expect(item.cssVars.dark.brand).toBe("#189547")
    expect(item.cssVars.light["mb-promo"]).toBe("#16a34a")
    expect(item.cssVars.theme["radius-card"]).toBe("var(--mb-card)")
    expect(item.cssVars.theme["spacing-gutter"]).toBe("var(--mb-gutter)")
    expect(item.css["@layer base"]).toBeDefined()
    expect(item.meta.preset).toMatch(/^b[0-9A-Za-z]+$/)
  })

  it("adds the upstream font registry item for Google fonts", () => {
    const item = buildRegistryItem(buildDesignSystem({ ...DEFAULT_STATE, font: "geist", fontHeading: "lora" }))
    expect(item.registryDependencies).toEqual(["utils", "font-geist", "font-heading-lora"])
  })
})

describe("tokens.css export", () => {
  it("has :root, .dark, @theme inline mappings and the same values", () => {
    const css = buildTokensCss(buildDesignSystem({ ...DEFAULT_STATE, extras }))
    expect(css).toMatch(/:root \{\n {2}--background: #ffffff;/)
    expect(css).toMatch(/\.dark \{[^}]*--primary: #f7c21c;/)
    expect(css).toContain("--color-mb-promo: var(--mb-promo);")
    expect(css).toContain("--color-ring: var(--ring);")
    expect(css).toContain("--radius-card: var(--mb-card);")
    expect(css).not.toContain("--color-radius:")
    expect(css).not.toContain("--color-z-modal:")
  })
})
