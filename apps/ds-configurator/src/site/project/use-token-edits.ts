// Edits of the token table as whole-document writes: each edit is one PUT from the loaded version.
// A value equal to the shadcn default drops the override, so "reset" and "type the old value" match.
import type { ProjectDetail, Row, TokensInput } from "../api"
import { inputOf, useSaveTokens } from "../queries"
import { useWriteKey } from "../write-keys"

export type Mode = "light" | "dark"
export type TokenEdit = { type: "set"; row: Row; mode: Mode; value: string } | { type: "reset"; name: string }

export function applyEdit(input: TokensInput, edit: TokenEdit): TokensInput {
  const overrides = { ...input.overrides }
  if (edit.type === "reset") {
    delete overrides[edit.name]
    return { overrides }
  }
  const { row, mode } = edit
  const entry = { ...overrides[row.name] }
  const v = edit.value.trim()
  if (!v || v === row.base[mode].css) delete entry[mode]
  else entry[mode] = v
  if (entry.light === undefined && entry.dark === undefined) delete overrides[row.name]
  else overrides[row.name] = entry
  return { overrides }
}

export function useTokenEdits(detail: ProjectDetail) {
  const key = useWriteKey(detail.project.id)
  const save = useSaveTokens(detail.project.id, key)
  const edit = (e: TokenEdit) => save.mutate({ version: detail.tokens.version, tokens: applyEdit(inputOf(detail), e) })
  return { canEdit: !!key, edit, save }
}
