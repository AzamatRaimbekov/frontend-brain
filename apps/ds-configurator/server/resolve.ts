// A project = the canonical shadcn values + its overrides. Resolves them into the values every
// output reads and into rows (the site table) - the rows are the figma.json variables.
import { contrastChecks, type ContrastCheck } from "@/lib/contrast"
import { buildFigmaPlan, type PlanVariable } from "@/lib/export/figma-plan"
import { applyOverrides, SHADCN_TOKENS, type TokenValues } from "@/lib/tokens"

import type { Project, TokensDoc } from "./store"

export type Row = PlanVariable
export type { ContrastCheck }
export type Resolved = { values: TokenValues; rows: Row[]; contrast: ContrastCheck[] }

export const projectValues = (doc: Pick<TokensDoc, "overrides">) => applyOverrides(SHADCN_TOKENS, doc.overrides)

export const planOf = (project: Pick<Project, "id" | "name">, doc: TokensDoc) =>
  buildFigmaPlan({ project: project.id, name: project.name, version: doc.version }, projectValues(doc), SHADCN_TOKENS)

export function resolveProject(project: Pick<Project, "id" | "name">, doc: TokensDoc): Resolved {
  const values = projectValues(doc)
  return { values, rows: planOf(project, doc).variables, contrast: contrastChecks(values) }
}
