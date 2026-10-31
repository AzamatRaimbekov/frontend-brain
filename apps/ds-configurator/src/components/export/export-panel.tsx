// Export: registry:base JSON (code), tokens.css (Tailwind v4), use_figma script (Figma variables).
import { useMemo, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/generated/kit/ui/alert"
import { Checkbox } from "@/generated/kit/ui/checkbox"
import { Label } from "@/generated/kit/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/generated/kit/ui/tabs"
import { buildFigmaScript, THEME_COLLECTIONS } from "@/lib/export/figma-script"
import { registryItemJson } from "@/lib/export/registry-item"
import { buildTokensCss } from "@/lib/export/tokens-css"
import { contrastChecks } from "@/lib/extra-tokens"
import type { DesignSystem } from "@/lib/types"

import { CodeOutput } from "./code-output"

export function ExportPanel({ designSystem }: { designSystem: DesignSystem }) {
  const [linkTheme, setLinkTheme] = useState(false)
  const ds = designSystem
  const json = useMemo(() => registryItemJson(ds), [ds])
  const css = useMemo(() => buildTokensCss(ds), [ds])
  const figma = useMemo(() => buildFigmaScript(ds, linkTheme), [ds, linkTheme])
  const failing = contrastChecks(ds.state.extras, ds.light, ds.dark).filter((c) => !c.ok)

  return (
    <div className="grid gap-3">
      {failing.length ? (
        <Alert tone="warning">
          <AlertTitle>Контраст ниже AA 4.5</AlertTitle>
          <AlertDescription>{[...new Set(failing.map((c) => `--${c.name} (${c.mode})`))].join(", ")}</AlertDescription>
        </Alert>
      ) : null}
      <Tabs defaultValue="registry">
        <TabsList variant="line" className="gap-4">
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
            hint="Код одного вызова use_figma (Full seat, права на редактирование). Пишет коллекцию Brand, режим = бренд."
          >
            <div className="flex items-start gap-2">
              <Checkbox id="link-theme" checked={linkTheme} onCheckedChange={(v) => setLinkTheme(v === true)} />
              <Label htmlFor="link-theme" className="grid gap-0.5 font-normal">
                <span>Связать с темой ({THEME_COLLECTIONS.join(" / ")})</span>
                <span className="text-caption text-muted-foreground">
                  Перепишет light/dark переменных темы на алиасы Brand. Сначала на ветке или копии библиотеки.
                </span>
              </Label>
            </div>
          </CodeOutput>
        </TabsContent>
      </Tabs>
    </div>
  )
}
