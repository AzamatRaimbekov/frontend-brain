// The project's write key in this browser: paste one, copy it for the widget, or issue a new one.
import { useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/generated/kit/ui/alert"
import { Button } from "@/generated/kit/ui/button"
import { Input } from "@/generated/kit/ui/input"
import { Label } from "@/generated/kit/ui/label"
import { copyText } from "@/lib/download"

import { ErrorAlert } from "../error-alert"
import { useRotateKey } from "../queries"
import { saveWriteKey, useWriteKey } from "../write-keys"

export function WriteKeyField({ id, compact = false }: { id: string; compact?: boolean }) {
  const key = useWriteKey(id)
  const rotate = useRotateKey(id, key)
  const [draft, setDraft] = useState("")
  const [copied, setCopied] = useState(false)
  const [shown, setShown] = useState(false)

  if (!key) {
    return (
      <Alert tone="info">
        <AlertTitle>Нужен ключ записи проекта</AlertTitle>
        <AlertDescription className="grid gap-2">
          <span>Смотреть может любой. Править токены — тот, у кого ключ (его выдали при создании проекта).</span>
          <form className="flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); saveWriteKey(id, draft.trim()) }}>
            <Input size="sm" className="w-80 font-mono" placeholder="dsk_…" value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Ключ записи" spellCheck={false} />
            <Button size="sm" type="submit" variant="secondary" disabled={!draft.trim().startsWith("dsk_")}>Сохранить в браузере</Button>
          </form>
        </AlertDescription>
      </Alert>
    )
  }
  if (compact) return null

  const copy = async () => setCopied(await copyText(key))
  return (
    <div className="grid gap-2">
      <Label htmlFor="write-key">Ключ записи (вставить в виджет)</Label>
      <div className="flex flex-wrap gap-2">
        <Input id="write-key" size="sm" readOnly className="w-80 font-mono" type={shown ? "text" : "password"} value={key} onFocus={(e) => e.currentTarget.select()} />
        <Button size="sm" variant="outline" onClick={() => setShown((s) => !s)} aria-pressed={shown}>{shown ? "Скрыть" : "Показать"}</Button>
        <Button size="sm" variant="secondary" onClick={copy}>{copied ? "Скопирован" : "Копировать"}</Button>
        <Button size="sm" variant="ghost" disabled={rotate.isPending} onClick={() => rotate.mutate()} title="Старый ключ перестанет работать">Выдать новый</Button>
        <Button size="sm" variant="ghost" onClick={() => saveWriteKey(id, "")}>Забыть в этом браузере</Button>
      </div>
      <ErrorAlert error={rotate.error} />
      <p className="text-caption text-muted-foreground">Ключ хранится только в этом браузере, на сервере — его хэш. Новый ключ надо заново вставить в виджет.</p>
    </div>
  )
}
