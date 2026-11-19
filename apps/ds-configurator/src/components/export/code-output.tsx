// One export: a hint, Copy + Download, and the generated text.
import { useState, type ReactNode } from "react"

import { Button } from "@/kit/ui/button"
import { copyText, downloadText } from "@/lib/download"

type CodeOutputProps = { filename: string; mime: string; text: string; hint: ReactNode }

export function CodeOutput({ filename, mime, text, hint }: CodeOutputProps) {
  const [status, setStatus] = useState<string | null>(null)
  const copy = async () => {
    setStatus((await copyText(text)) ? "Скопировано" : "Не удалось скопировать: выделите текст вручную")
    window.setTimeout(() => setStatus(null), 2000)
  }
  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs" variant="secondary" onClick={copy}>
          Копировать
        </Button>
        <Button size="xs" variant="outline" onClick={() => downloadText(filename, text, mime)}>
          Скачать {filename}
        </Button>
        <span aria-live="polite" className="text-xs text-muted-foreground">
          {status}
        </span>
      </div>
      <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 font-mono text-[11px] text-foreground">
        <code>{text}</code>
      </pre>
    </div>
  )
}
