// «Figma»: link the project's file, how to connect the Mbank Tokens widget, last sync, write key.
import { useState, type FormEvent } from "react"

import { Badge } from "@/generated/kit/ui/badge"
import { Button } from "@/generated/kit/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/generated/kit/ui/card"
import { Input } from "@/generated/kit/ui/input"
import { Label } from "@/generated/kit/ui/label"

import { siteUrls, type ProjectDetail } from "../api"
import { ErrorAlert } from "../error-alert"
import { useLinkFigma } from "../queries"
import { useWriteKey } from "../write-keys"
import { HistoryList } from "./history-list"
import { WriteKeyField } from "./write-key-field"

const when = (iso: string) => new Date(iso).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })

function SyncStatus({ detail }: { detail: ProjectDetail }) {
  const sync = detail.project.figma?.lastSync
  if (!sync) return <Badge tone="clear">Синхронизаций ещё не было</Badge>
  const same = sync.version === detail.tokens.version
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Badge tone={same ? "success" : "warning"}>{same ? "Figma на текущей версии" : `Figma на версии ${sync.version}, сайт — ${detail.tokens.version}`}</Badge>
      <span className="text-muted-foreground">
        {sync.from === "site" ? "Виджет получил с сайта" : "Виджет отправил на сайт"} версию {sync.version}, {when(sync.at)}
      </span>
    </div>
  )
}

function LinkForm({ detail }: { detail: ProjectDetail }) {
  const key = useWriteKey(detail.project.id)
  const link = useLinkFigma(detail.project.id, key)
  const [fileKey, setFileKey] = useState(detail.project.figma?.fileKey ?? "")
  const [fileName, setFileName] = useState(detail.project.figma?.fileName ?? "")
  const submit = (e: FormEvent) => {
    e.preventDefault()
    link.mutate({ fileKey: fileKey.trim(), fileName: fileName.trim() || undefined }, {
      onSuccess: (r) => { setFileKey(r.project.figma?.fileKey ?? ""); setFileName(r.project.figma?.fileName ?? "") },
    })
  }
  return (
    <form onSubmit={submit} className="grid gap-3" noValidate>
      <div className="grid gap-1.5">
        <Label htmlFor="f-key">Ссылка на файл или ключ файла</Label>
        <Input id="f-key" size="sm" className="font-mono" placeholder="https://www.figma.com/design/…" value={fileKey} onChange={(e) => setFileKey(e.target.value)} spellCheck={false} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="f-name">Название файла</Label>
        <Input id="f-name" size="sm" placeholder="из ссылки, если пусто" value={fileName} onChange={(e) => setFileName(e.target.value)} />
      </div>
      <ErrorAlert error={link.error} />
      <Button type="submit" size="sm" variant="secondary" disabled={!key || !fileKey.trim() || link.isPending}>
        {link.isSuccess ? "Сохранено" : "Привязать файл"}
      </Button>
    </form>
  )
}

export function FigmaTab({ detail }: { detail: ProjectDetail }) {
  const urls = siteUrls(detail.project.id)
  const file = detail.project.figma
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle>Файл Figma</CardTitle>
          <CardDescription>{file?.fileKey ? `${file.fileName || "Без названия"} · ${file.fileKey}` : "Файл ещё не привязан"}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 px-4">
          <SyncStatus detail={detail} />
          <LinkForm detail={detail} />
        </CardContent>
      </Card>
      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle>Подключить виджет Mbank Tokens</CardTitle>
          <CardDescription>Сайт не пишет в Figma сам: виджет берёт токены отсюда и записывает их в коллекцию «shadcn».</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 text-sm">
          <ol className="grid list-decimal gap-1.5 pl-5">
            <li>В файле Figma поставьте виджет Mbank Tokens (Resources → Widgets → Development).</li>
            <li>Выделите виджет → «Сайт» и заполните: адрес <code className="font-mono">{urls.site}</code>, проект <code className="font-mono">{detail.project.id}</code>, ключ записи (ниже).</li>
            <li>«Получить с сайта» — создаст или обновит коллекцию «shadcn» (light, dark): ссылки на Foundation, свои токены — значениями.</li>
            <li>Правки дизайнера — «Отправить на сайт». Если на сайте новее, виджет покажет конфликт.</li>
          </ol>
          <WriteKeyField id={detail.project.id} />
        </CardContent>
      </Card>
      <HistoryList id={detail.project.id} />
    </div>
  )
}
