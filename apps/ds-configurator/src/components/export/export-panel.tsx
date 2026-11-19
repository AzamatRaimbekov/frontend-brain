// Export: registry:base JSON (code), tokens.css (Tailwind v4), use_figma script (collection shadcn).
import { useMemo } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/kit/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/kit/ui/tabs"
import { contrastChecks } from "@/lib/contrast"
import { buildFigmaScript } from "@/lib/export/figma-script"
import { registryItemJson } from "@/lib/export/registry-item"
import { buildTokensCss } from "@/lib/export/tokens-css"
import type { DesignSystem } from "@/lib/types"

import { CodeOutput } from "./code-output"

export function ExportPanel({ designSystem: ds }: { designSystem: DesignSystem }) {
  const json = useMemo(() => registryItemJson(ds), [ds])
  const css = useMemo(() => buildTokensCss(ds), [ds])
  const figma = useMemo(() => buildFigmaScript(ds), [ds])
  const failing = useMemo(() => contrastChecks(ds.values).filter((c) => !c.ok), [ds])

  return (
    <div className="grid gap-3">
      {failing.length ? (
        <Alert>
          <AlertTitle>Контраст ниже AA 4.5</AlertTitle>
          <AlertDescription>{failing.map((c) => `--${c.fg} на --${c.bg} (${c.mode} ${c.ratio ?? "?"})`).join(", ")}</AlertDescription>
        </Alert>
      ) : null}
      <Tabs defaultValue="registry">
        <TabsList className="w-full">
          <TabsTrigger value="registry">registry:base</TabsTrigger>
          <TabsTrigger value="css">tokens.css</TabsTrigger>
          <TabsTrigger value="figma">Figma</TabsTrigger>
        </TabsList>
        <TabsContent value="registry" className="pt-3">
          <CodeOutput
            filename={`${ds.name}.json`}
            mime="application/json"
            text={json}
            hint={<>Положите в registry (public/r/{ds.name}.json) и ставьте: <code>npx shadcn@latest add &lt;url&gt;/r/{ds.name}.json</code></>}
          />
        </TabsContent>
        <TabsContent value="css" className="pt-3">
          <CodeOutput filename="tokens.css" mime="text/css" text={css} hint="Импорт после tailwindcss: :root, .dark, @theme inline. Значения те же, что в JSON и Figma." />
        </TabsContent>
        <TabsContent value="figma" className="pt-3">
          <CodeOutput
            filename={`${ds.name}.figma.js`}
            mime="text/javascript"
            text={figma}
            hint="Код одного вызова use_figma (Full seat, права на редактирование). Пишет коллекцию shadcn, режимы Light / Dark, сырые значения."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
