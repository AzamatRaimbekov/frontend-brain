// Live preview of the project's tokens on the standard shadcn components, light or dark.
import { useMemo, useState } from "react"

import { KitShowcase } from "@/components/preview/kit-showcase"
import { PreviewFrame } from "@/components/preview/preview-frame"
import { Button } from "@/kit/ui/button"
import { projectDesignSystem } from "@/lib/design-system"
import { applyOverrides, SHADCN_TOKENS } from "@/lib/tokens"

import type { ProjectDetail } from "../api"

export function ProjectPreview({ detail }: { detail: ProjectDetail }) {
  const [dark, setDark] = useState(false)
  const ds = useMemo(
    () => projectDesignSystem(detail.project.id, applyOverrides(SHADCN_TOKENS, detail.tokens.overrides)),
    [detail.project.id, detail.tokens.overrides]
  )
  return (
    <section aria-labelledby="preview-title" className="grid gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 id="preview-title" className="text-sm font-semibold">Превью</h2>
        <div role="group" aria-label="Тема превью" className="flex gap-1">
          <Button size="xs" variant={dark ? "outline" : "secondary"} aria-pressed={!dark} onClick={() => setDark(false)}>Светлая</Button>
          <Button size="xs" variant={dark ? "secondary" : "outline"} aria-pressed={dark} onClick={() => setDark(true)}>Тёмная</Button>
        </div>
      </div>
      <PreviewFrame designSystem={ds} dark={dark}>
        <KitShowcase />
      </PreviewFrame>
    </section>
  )
}
