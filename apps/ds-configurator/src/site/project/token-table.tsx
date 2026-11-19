// Token table: swatches, light/dark values (edited in place, saved on blur or Enter), the shadcn
// default, status and reset. Radius and fonts have one value for both themes.
import { Badge } from "@/kit/ui/badge"
import { Button } from "@/kit/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/kit/ui/table"

import type { Row } from "../api"
import type { Mode, TokenEdit } from "./use-token-edits"

const Swatch = ({ value }: { value: string | number | null }) =>
  typeof value === "string" ? (
    <span aria-hidden className="inline-block size-5 shrink-0 rounded-sm border border-border" style={{ background: value }} />
  ) : null

type ValueCellProps = { row: Row; mode: Mode; canEdit: boolean; onEdit: (e: TokenEdit) => void }

function ValueCell({ row, mode, canEdit, onEdit }: ValueCellProps) {
  const value = row.values[mode].css
  const resolved = row.values[mode].value
  const commit = (next: string) => {
    if (next.trim() !== value) onEdit({ type: "set", row, mode, value: next })
  }
  return (
    <div className="flex items-center gap-2">
      {row.kind === "color" ? <Swatch value={resolved} /> : null}
      <input
        key={value}
        defaultValue={value}
        disabled={!canEdit}
        aria-label={`--${row.name} ${mode}`}
        spellCheck={false}
        className="h-8 w-44 rounded-sm border border-input bg-background px-2 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-70"
        onBlur={(e) => commit(e.currentTarget.value)}
        onKeyDown={(e) => {
          // One commit path (blur): disabling the input while saving blurs it too.
          if (e.key === "Escape") e.currentTarget.value = value
          if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur()
        }}
      />
      {row.kind !== "color" && resolved !== null ? <span className="text-xs text-muted-foreground">{row.kind === "radius" ? `${resolved}px` : resolved}</span> : null}
    </div>
  )
}

function Default({ row }: { row: Row }) {
  const { light, dark } = row.base
  return (
    <span className="grid font-mono text-xs text-muted-foreground">
      <span>{light.css}</span>
      {row.kind === "color" && dark.css !== light.css ? <span>dark: {dark.css}</span> : null}
    </span>
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
            <TableHead>По умолчанию shadcn</TableHead>
            <TableHead className="sr-only">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="align-top">
                <div className="font-mono text-sm">--{row.name}</div>
                <div className="mt-1 flex gap-1">
                  {row.overridden ? <Badge variant="secondary">изменён</Badge> : null}
                  {row.kind !== "color" ? <Badge variant="outline">{row.kind}</Badge> : null}
                </div>
              </TableCell>
              <TableCell><ValueCell row={row} mode="light" canEdit={canEdit} onEdit={onEdit} /></TableCell>
              <TableCell>
                {row.kind === "color" ? <ValueCell row={row} mode="dark" canEdit={canEdit} onEdit={onEdit} /> : <span className="text-xs text-muted-foreground">как в светлой</span>}
              </TableCell>
              <TableCell className="max-w-72"><Default row={row} /></TableCell>
              <TableCell className="text-right">
                {row.overridden ? (
                  <Button size="xs" variant="ghost" disabled={!canEdit} title="Вернуть значение shadcn" onClick={() => onEdit({ type: "reset", name: row.name })}>Сбросить</Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
