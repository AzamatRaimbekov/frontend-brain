// «Код»: install the project's design system with the shadcn CLI, or take tokens.css directly.
import { useState } from "react"

import { Button, buttonVariants } from "@/generated/kit/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/generated/kit/ui/card"
import { copyText } from "@/lib/download"

import { siteUrls, type ProjectDetail } from "../api"

function Command({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="grid gap-1.5">
      <span className="text-caption text-muted-foreground">{label}</span>
      <div className="flex items-start gap-2">
        <pre className="min-w-0 flex-1 overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">{text}</pre>
        <Button size="xs" variant="outline" onClick={async () => setCopied(await copyText(text))}>{copied ? "Скопировано" : "Копировать"}</Button>
      </div>
    </div>
  )
}

export function CodeTab({ detail }: { detail: ProjectDetail }) {
  const urls = siteUrls(detail.project.id)
  const id = detail.project.id
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle>shadcn CLI</CardTitle>
          <CardDescription>registry:base — вся дизайн-система проекта (версия {detail.tokens.version}): cssVars light/dark и тема Tailwind v4.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 px-4">
          <Command label="Новый проект" text={`npx shadcn@latest init ${urls.registry}`} />
          <Command label="Обновить токены в существующем" text={`npx shadcn@latest add ${urls.registry}`} />
          <p className="text-caption text-muted-foreground">После правок на сайте или из Figma повторите add — CLI перезапишет переменные.</p>
        </CardContent>
      </Card>
      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle>tokens.css</CardTitle>
          <CardDescription>Тот же генератор, что frontend-pack tokens.css: Mbank + правки проекта + свои токены.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 px-4">
          <div className="flex flex-wrap gap-2">
            <a className={buttonVariants({ size: "sm", variant: "brand" })} href={urls.css} download={`${id}-tokens.css`}>Скачать tokens.css</a>
            <a className={buttonVariants({ size: "sm", variant: "outline" })} href={urls.css} target="_blank" rel="noreferrer">Открыть</a>
            <a className={buttonVariants({ size: "sm", variant: "outline" })} href={urls.figma} target="_blank" rel="noreferrer">figma.json</a>
          </div>
          <Command label="В проект" text={`curl -o src/styles/tokens.css ${urls.css}`} />
          <Command label="Подключить (src/index.css)" text={'@import "tailwindcss";\n@import "tw-animate-css";\n@import "./styles/tokens.css";'} />
        </CardContent>
      </Card>
    </div>
  )
}
