// Token table: swatches, light/dark values (edited in place, saved on blur or Enter), where the
// value comes from in Mbank Foundation (alias), status and reset / delete.
import { Badge } from "@/generated/kit/ui/badge"
import { Button } from "@/generated/kit/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/generated/kit/ui/table"

import type { Row } from "../api"
import type { Mode, TokenEdit } from "./use-token-edits"

type ValueSource = NonNullable<Row["base"]>["source"]["light"]

function sourceLabel(src: ValueSource) {
  if ("alias" in src) return `${src.alias.collection} / ${src.alias.name}${src.alias.mode ? ` (${src.alias.mode})` : ""}`
  if ("ref" in src) return `→ --${src.ref}`
  return "значение"
}

function Alias({ row }: { row: Row }) {
  if (!row.base) return <span className="text-muted-foreground">свой токен проекта</span>
  const light = sourceLabel(row.base.source.light)
  const dark = sourceLabel(row.base.source.dark)
  return (
    <span className="grid text-caption">
      <span>{light}</span>
      {dark !== light ? <span className="text-muted-foreground">dark: {dark}</span> : null}
    </span>
  )
}

const Swatch = ({ value }: { value: string | number | null }) =>
  typeof value === "string" ? (
    <span aria-hidden className="inline-block size-5 shrink-0 rounded-xs border border-border" style={{ background: value }} />
  ) : null

type ValueCellProps = { row: Row; mode: Mode; canEdit: boolean; onEdit: (e: TokenEdit) => void }

function ValueCell({ row, mode, canEdit, onEdit }: ValueCellProps) {
  const value = row[mode]
  const commit = (next: string) => {
    if (next.trim() !== value) onEdit({ type: "set", row, mode, value: next })
  }
  return (
    <div className="flex items-center gap-2">
      {row.kind === "color" ? <Swatch value={row.resolved[mode]} /> : null}
      <input
        key={value}
        defaultValue={value}
        disabled={!canEdit}
        aria-label={`--${row.name} ${mode}`}
        spellCheck={false}
        className="h-8 w-36 rounded-xs border border-input bg-background px-2 font-mono text-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-70"
        onBlur={(e) => commit(e.currentTarget.value)}
        onKeyDown={(e) => {
          // One commit path (blur): disabling the input while saving blurs it too.
          if (e.key === "Escape") e.currentTarget.value = value
          if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur()
        }}
      />
    </div>
  )
}

type TokenTableProps = { rows: Row[]; canEdit: boolean; onEdit: (e: TokenEdit) => void }

export function TokenTable({ rows, canEdit, onEdit }: TokenTableProps) {
  if (!rows.length) return <p className="py-6 text-sm text-muted-foreground">Ничего не нашлось.</p>
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Токен</TableHead>
            <TableHead>Светлая</TableHead>
            <TableHead>Тёмная</TableHead>
            <TableHead>Mbank Foundation</TableHead>
            <TableHead className="sr-only">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const changed = row.overridden.light || row.overridden.dark
            return (
              <TableRow key={row.name}>
                <TableCell className="align-top">
                  <div className="font-mono text-sm">--{row.name}</div>
                  <div className="mt-1 flex gap-1">
                    {row.custom ? <Badge size="sm" tone="info">свой</Badge> : null}
                    {changed ? <Badge size="sm" tone="warning">изменён</Badge> : null}
                    {row.kind !== "color" ? <Badge size="sm">{row.kind}</Badge> : null}
                  </div>
                </TableCell>
                <TableCell><ValueCell row={row} mode="light" canEdit={canEdit} onEdit={onEdit} /></TableCell>
                <TableCell><ValueCell row={row} mode="dark" canEdit={canEdit && row.scope !== "theme"} onEdit={onEdit} /></TableCell>
                <TableCell className="max-w-72"><Alias row={row} /></TableCell>
                <TableCell className="text-right">
                  {row.custom ? (
                    <Button size="xs" variant="ghost" disabled={!canEdit} onClick={() => onEdit({ type: "remove", name: row.name })}>Удалить</Button>
                  ) : changed ? (
                    <Button size="xs" variant="ghost" disabled={!canEdit} title="Вернуть значение Mbank" onClick={() => onEdit({ type: "reset", name: row.name })}>Сбросить</Button>
                  ) : null}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
