// Site token table edits -> the document the PUT sends.
import { describe, expect, it } from "vitest"

import type { Row, TokensInput } from "@/site/api"
import { parseHash } from "@/site/router"
import { applyEdit } from "@/site/project/use-token-edits"

const base: TokensInput = { brand: "bank", prefix: "mb", overrides: { primary: { light: "#7c3aed" } }, custom: [{ name: "mb-promo", kind: "color", light: "#fff", dark: "#000" }] }
const row = (name: string, custom = false): Row => ({
  name, kind: "color", scope: "root", custom, light: "", dark: "",
  base: custom ? null : { light: "#fddb2b", dark: "#f7c21c", source: { light: { literal: true }, dark: { literal: true } }, resolved: { light: null, dark: null } },
  overridden: { light: false, dark: false }, resolved: { light: null, dark: null },
})

describe("token edits", () => {
  it("typing the base value back drops the override", () => {
    expect(applyEdit(base, { type: "set", row: row("primary"), mode: "light", value: "#fddb2b" }).overrides).toEqual({})
    expect(applyEdit(base, { type: "set", row: row("primary"), mode: "dark", value: "#000" }).overrides.primary).toEqual({ light: "#7c3aed", dark: "#000" })
  })
  it("custom tokens: edit, add, remove; reset", () => {
    expect(applyEdit(base, { type: "set", row: row("mb-promo", true), mode: "dark", value: " #111 " }).custom[0].dark).toBe("#111")
    expect(applyEdit(base, { type: "remove", name: "mb-promo" }).custom).toEqual([])
    expect(applyEdit(base, { type: "add", token: { name: "mb-x", kind: "size", light: "8px", dark: "8px" } }).custom).toHaveLength(2)
    expect(applyEdit(base, { type: "reset", name: "primary" }).overrides).toEqual({})
  })
  it("hash routes", () => {
    expect(parseHash("#/p/credit/figma")).toEqual({ page: "project", id: "credit", tab: "figma" })
    expect(parseHash("#/p/credit/nope")).toEqual({ page: "project", id: "credit", tab: "tokens" })
    expect(parseHash("#/configurator")).toEqual({ page: "configurator" })
    expect(parseHash("")).toEqual({ page: "projects" })
  })
})
