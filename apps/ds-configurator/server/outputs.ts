// Generated outputs of a project: tokens.css, the shadcn registry:base item and figma.json (the plan
// of the `shadcn` variable collection the widget writes). All from the same resolved values.
import { projectDesignSystem } from "@/lib/design-system"
import { buildRegistryItem } from "@/lib/export/registry-item"
import { buildTokensCss } from "@/lib/export/tokens-css"

import { planOf, projectValues } from "./resolve"
import type { Project, TokensDoc } from "./store"

export function tokensCss(project: Project, doc: TokensDoc) {
  const changed = Object.keys(doc.overrides)
  return buildTokensCss(projectDesignSystem(project.id, projectValues(doc)), [
    `Project "${project.name}" (${project.id}), version ${doc.version}.`,
    changed.length ? `Changed from the shadcn defaults: ${changed.join(", ")}.` : "Standard shadcn values (no changes).",
  ])
}

/** shadcn registry:base item, built by the configurator's export code from the project values. */
export function registryItem(project: Project, doc: TokensDoc) {
  const item = buildRegistryItem(projectDesignSystem(project.id, projectValues(doc)))
  return {
    ...item,
    title: project.name,
    description: `${project.name}: shadcn/ui design system, version ${doc.version}`,
    meta: { ...item.meta, project: project.id, version: doc.version },
  }
}

export const figmaPlan = planOf
