// Scopes the design system to the preview (like upstream design-system-provider, which writes the
// theme vars into a <style> for :root/.dark): here [data-preview] and [data-preview].dark.
import type { ReactNode } from "react"

import { cn } from "@/generated/kit/lib/utils"
import { buildPreviewCss, fontStylesheetUrl } from "@/lib/preview-css"
import type { DesignSystem } from "@/lib/types"

type PreviewFrameProps = { designSystem: DesignSystem; dark: boolean; children: ReactNode }

export function PreviewFrame({ designSystem, dark, children }: PreviewFrameProps) {
  const fontUrl = fontStylesheetUrl(designSystem)
  return (
    <section
      data-preview
      aria-label="Живое превью"
      className={cn("min-w-0 rounded-xl border border-border bg-background p-4 text-foreground shadow-sm md:p-6", dark && "dark")}
    >
      <style>{buildPreviewCss(designSystem)}</style>
      {fontUrl ? <link rel="stylesheet" href={fontUrl} /> : null}
      {children}
    </section>
  )
}
