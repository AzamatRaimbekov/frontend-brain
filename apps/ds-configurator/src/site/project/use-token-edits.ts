// Edits of the token table as whole-document writes: each edit is one PUT from the loaded version.
// A value equal to the base drops the override, so "reset" and "type the old value" are the same.
import type { ExtraToken } from "@/lib/types"

import type { ProjectDetail, Row, TokensInput } from "../api"
import { inputOf, useSaveTokens } from "../queries"
import { useWriteKey } from "../write-keys"

export type Mode = "light" | "dark"
export type TokenEdit =
  | { type: "set"; row: Row; mode: Mode; value: string }
  | { type: "reset"; name: string }
  | { type: "add"; token: ExtraToken }
  | { type: "remove"; name: string }

export function applyEdit(input: TokensInput, edit: TokenEdit): TokensInput {
  const overrides = { ...input.overrides }
  let custom = input.custom
  if (edit.type === "set" && edit.row.custom) {
    custom = custom.map((t) => (t.name === edit.row.name ? { ...t, [edit.mode]: edit.value.trim() } : t))
  } else if (edit.type === "set" && edit.row.base) {
    const entry = { ...overrides[edit.row.name] }
    const v = edit.value.trim()
    if (!v || v === edit.row.base[edit.mode]) delete entry[edit.mode]
    else entry[edit.mode] = v
    if (entry.light === undefined && entry.dark === undefined) delete overrides[edit.row.name]
    else overrides[edit.row.name] = entry
  } else if (edit.type === "reset") {
    delete overrides[edit.name]
  } else if (edit.type === "add") {
    custom = [...custom, edit.token]
  } else if (edit.type === "remove") {
    custom = custom.filter((t) => t.name !== edit.name)
  }
  return { ...input, overrides, custom }
}

export function useTokenEdits(detail: ProjectDetail) {
  const key = useWriteKey(detail.project.id)
  const save = useSaveTokens(detail.project.id, key)
  const edit = (e: TokenEdit) => save.mutate({ version: detail.tokens.version, tokens: applyEdit(inputOf(detail), e) })
  return { canEdit: !!key, edit, save }
}
