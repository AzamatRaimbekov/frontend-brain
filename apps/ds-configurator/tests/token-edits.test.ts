// Site token table edits -> the document the PUT sends.
import { describe, expect, it } from "vitest"

import { buildFigmaPlan } from "@/lib/export/figma-plan"
import { SHADCN_TOKENS } from "@/lib/tokens"
import type { TokensInput } from "@/site/api"
import { applyEdit } from "@/site/project/use-token-edits"
import { parseHash } from "@/site/router"

const rows = buildFigmaPlan({ project: "p", name: "P", version: 1 }, SHADCN_TOKENS, SHADCN_TOKENS).variables
const row = (name: string) => rows.find((r) => r.name === name)!
const base: TokensInput = { overrides: { primary: { light: "#7c3aed" } } }

describe("token edits", () => {
  it("typing the default value back drops the override", () => {
    expect(applyEdit(base, { type: "set", row: row("primary"), mode: "light", value: SHADCN_TOKENS.colors.primary.light }).overrides).toEqual({})
    expect(applyEdit(base, { type: "set", row: row("primary"), mode: "dark", value: "#000" }).overrides.primary).toEqual({ light: "#7c3aed", dark: "#000" })
  })
  it("reset and single-value tokens", () => {
    expect(applyEdit(base, { type: "reset", name: "primary" }).overrides).toEqual({})
    expect(applyEdit(base, { type: "set", row: row("radius"), mode: "light", value: " 8px " }).overrides.radius).toEqual({ light: "8px" })
  })
  it("routes", () => {
    expect(parseHash("#/p/credit/figma")).toEqual({ page: "project", id: "credit", tab: "figma" })
    expect(parseHash("#/configurator")).toEqual({ page: "configurator" })
    expect(parseHash("")).toEqual({ page: "projects" })
  })
})
