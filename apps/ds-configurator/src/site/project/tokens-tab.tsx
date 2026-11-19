// «Токены»: the shadcn token table (light / dark, default, edit), live preview, contrast.
import { useDeferredValue, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/kit/ui/alert"
import { Button } from "@/kit/ui/button"
import { Input } from "@/kit/ui/input"

import { ApiError, type ProjectDetail } from "../api"
import { ErrorAlert } from "../error-alert"
import { ContrastPanel } from "./contrast-panel"
import { ProjectPreview } from "./project-preview"
import { TokenTable } from "./token-table"
import { useTokenEdits } from "./use-token-edits"
import { WriteKeyField } from "./write-key-field"

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "color", label: "Цвета" },
  { id: "other", label: "Радиус и шрифты" },
  { id: "changed", label: "Изменённые" },
] as const
type Filter = (typeof FILTERS)[number]["id"]

export function TokensTab({ detail }: { detail: ProjectDetail }) {
  const { canEdit, edit, save } = useTokenEdits(detail)
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const q = useDeferredValue(query.trim().toLowerCase())
  const editable = detail.rows.filter((r) => r.editable)
  const rows = editable.filter((r) => {
    if (filter === "color" && r.kind !== "color") return false
    if (filter === "other" && r.kind === "color") return false
    if (filter === "changed" && !r.overridden) return false
    return !q || r.name.includes(q)
  })
  const conflict = save.error instanceof ApiError && save.error.status === 409

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]">
      <section aria-label="Токены shadcn" className="grid min-w-0 content-start gap-3">
        {!canEdit ? <WriteKeyField id={detail.project.id} compact /> : null}
        {conflict ? (
          <Alert>
            <AlertTitle>На сайте уже новее версия</AlertTitle>
            <AlertDescription>Пока вы правили, токены изменили в другом месте (сайт или Figma). Таблица обновлена — повторите правку.</AlertDescription>
          </Alert>
        ) : save.isError ? <ErrorAlert error={save.error} title="Не сохранилось" /> : null}
        <div className="flex flex-wrap items-center gap-2">
          <Input className="h-8 w-56" type="search" placeholder="Поиск: primary, sidebar…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Поиск токена" />
          <div role="group" aria-label="Фильтр" className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <Button key={f.id} size="xs" variant={filter === f.id ? "secondary" : "outline"} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </Button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {rows.length} из {editable.length}{save.isPending ? " · сохраняю…" : ""}
          </span>
        </div>
        <TokenTable rows={rows} canEdit={canEdit && !save.isPending} onEdit={edit} />
        <p className="text-xs text-muted-foreground">
          Только стандартные токены shadcn: меняются значения, новые имена не добавляются. Радиусы radius-sm…4xl считаются от --radius.
        </p>
      </section>
      <aside className="grid min-w-0 content-start gap-4">
        <ProjectPreview detail={detail} />
        <ContrastPanel checks={detail.contrast} />
      </aside>
    </div>
  )
}
