// «Токены»: the shadcn token table (light / dark, Mbank alias, edit), add a custom token, contrast.
import { useDeferredValue, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/generated/kit/ui/alert"
import { Button } from "@/generated/kit/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/generated/kit/ui/card"
import { Input } from "@/generated/kit/ui/input"
import { ExtraTokenForm } from "@/components/extra-tokens/extra-token-form"

import { ApiError, type ProjectDetail } from "../api"
import { ErrorAlert } from "../error-alert"
import { ContrastPanel } from "./contrast-panel"
import { TokenTable } from "./token-table"
import { useTokenEdits } from "./use-token-edits"
import { WriteKeyField } from "./write-key-field"

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "color", label: "Цвета" },
  { id: "radius", label: "Радиусы" },
  { id: "changed", label: "Изменённые" },
  { id: "custom", label: "Свои" },
] as const
type Filter = (typeof FILTERS)[number]["id"]

export function TokensTab({ detail }: { detail: ProjectDetail }) {
  const { canEdit, edit, save } = useTokenEdits(detail)
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const q = useDeferredValue(query.trim().toLowerCase())
  const rows = detail.rows.filter((r) => {
    if (filter === "color" && r.kind !== "color") return false
    if (filter === "radius" && r.kind !== "radius") return false
    if (filter === "changed" && !(r.overridden.light || r.overridden.dark)) return false
    if (filter === "custom" && !r.custom) return false
    if (!q) return true
    const alias = r.base && "alias" in r.base.source.light ? r.base.source.light.alias.name : ""
    return r.name.includes(q) || alias.toLowerCase().includes(q)
  })
  const conflict = save.error instanceof ApiError && save.error.status === 409

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section aria-label="Токены shadcn" className="grid min-w-0 content-start gap-3">
        {!canEdit ? <WriteKeyField id={detail.project.id} compact /> : null}
        {conflict ? (
          <Alert tone="warning" role="alert">
            <AlertTitle>На сайте уже новее версия</AlertTitle>
            <AlertDescription>Пока вы правили, токены изменили в другом месте (сайт или Figma). Таблица обновлена — повторите правку.</AlertDescription>
          </Alert>
        ) : save.isError ? <ErrorAlert error={save.error} title="Не сохранилось" /> : null}
        <div className="flex flex-wrap items-center gap-2">
          <Input size="sm" className="w-64" type="search" placeholder="Поиск: primary, text/default…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Поиск токена" />
          <div role="group" aria-label="Фильтр" className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <Button key={f.id} size="xs" variant={filter === f.id ? "secondary" : "outline"} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </Button>
            ))}
          </div>
          <span className="text-caption text-muted-foreground" aria-live="polite">
            {rows.length} из {detail.rows.length}{save.isPending ? " · сохраняю…" : ""}
          </span>
        </div>
        <TokenTable rows={rows} canEdit={canEdit && !save.isPending} onEdit={edit} />
      </section>
      <aside className="grid content-start gap-4">
        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle>Свой токен</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            {canEdit ? (
              <ExtraTokenForm
                prefix={detail.tokens.prefix}
                taken={new Set(detail.rows.map((r) => r.name))}
                onAdd={(token) => edit({ type: "add", token })}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Нужен ключ записи проекта.</p>
            )}
          </CardContent>
        </Card>
        <ContrastPanel checks={detail.contrast} />
      </aside>
    </div>
  )
}
