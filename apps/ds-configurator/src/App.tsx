// The configurator (#/configurator): fork of shadcn/ui /create on the standard shadcn token set.
import { useMemo, useState } from "react"

import { Button } from "@/kit/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/kit/ui/card"
import { buildDesignSystem } from "@/lib/design-system"
import { copyText } from "@/lib/download"
import { normalizeState } from "@/lib/share"
import type { ConfiguratorState } from "@/lib/types"
import { encodePreset } from "@/upstream/preset"

import { Customizer } from "./components/customizer"
import { ExportPanel } from "./components/export/export-panel"
import { KitShowcase } from "./components/preview/kit-showcase"
import { PreviewFrame } from "./components/preview/preview-frame"
import { useConfigurator } from "./hooks/use-configurator"

export function App() {
  const { state, update, designSystem } = useConfigurator()
  const [override, setOverride] = useState<Partial<ConfiguratorState> | null>(null)
  const [dark, setDark] = useState(false)
  // Hover preview, like upstream usePreviewOverride: the picker item under the pointer, not yet chosen.
  const previewSystem = useMemo(
    () => (override ? buildDesignSystem(normalizeState({ ...state, ...override })) : designSystem),
    [override, state, designSystem]
  )

  return (
    <div className="min-h-svh bg-muted/40 text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 md:px-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">Конфигуратор shadcn</h1>
          <p className="text-xs text-muted-foreground">
            {designSystem.name} · preset <code>{encodePreset(state)}</code> · форк shadcn/ui /create
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setDark((d) => !d)} aria-pressed={dark}>
            {dark ? "Светлая" : "Тёмная"} тема превью
          </Button>
          <Button size="sm" variant="secondary" onClick={() => copyText(window.location.href)}>
            Ссылка на пресет
          </Button>
        </div>
      </header>
      <main className="grid gap-4 p-4 md:p-6 lg:grid-cols-[15rem_minmax(0,1fr)] 2xl:grid-cols-[15rem_minmax(0,1fr)_28rem]">
        <Customizer state={state} onChange={update} onPreview={setOverride} />
        <PreviewFrame designSystem={previewSystem} dark={dark}>
          <KitShowcase />
        </PreviewFrame>
        <Card className="self-start py-4 lg:col-span-2 2xl:col-span-1">
          <CardHeader className="px-4">
            <CardTitle>Экспорт</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <ExportPanel designSystem={designSystem} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
