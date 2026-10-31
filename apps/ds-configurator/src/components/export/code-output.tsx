// One export: a hint, Copy + Download, and the generated text.
import { useState, type ReactNode } from "react"

import { Button } from "@/generated/kit/ui/button"
import { copyText, downloadText } from "@/lib/download"

type CodeOutputProps = { filename: string; mime: string; text: string; hint: ReactNode; children?: ReactNode }

export function CodeOutput({ filename, mime, text, hint, children }: CodeOutputProps) {
  const [status, setStatus] = useState<string | null>(null)
  const copy = async () => {
    setStatus((await copyText(text)) ? "Скопировано" : "Не удалось скопировать: выделите текст вручную")
    window.setTimeout(() => setStatus(null), 2000)
  }
  return (
    <div className="grid gap-3">
      <p className="text-caption text-muted-foreground">{hint}</p>
      {children}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs" variant="secondary" onClick={copy}>
          Копировать
        </Button>
        <Button size="xs" variant="outline" onClick={() => downloadText(filename, text, mime)}>
          Скачать {filename}
        </Button>
        <span aria-live="polite" className="text-caption text-muted-foreground">
          {status}
        </span>
      </div>
      <pre className="max-h-96 overflow-auto rounded-md bg-surface-inverse p-3 font-mono text-2xs text-inverse-foreground">
        <code>{text}</code>
      </pre>
    </div>
  )
}
