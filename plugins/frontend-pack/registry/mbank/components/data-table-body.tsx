import type * as React from "react"
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table"

import { Skeleton } from "./skeleton"
import { TableBody, TableCell, TableRow } from "./table"

type DataTableBodyProps<TData> = {
  table: TanstackTable<TData>
  loading: boolean
  loadingRows: number
  empty?: React.ReactNode
}

/** Rows of DataTable: Skeleton rows while loading, one full-width empty cell, or the page rows. */
function DataTableBody<TData>({ table, loading, loadingRows, empty }: DataTableBodyProps<TData>) {
  const columns = table.getVisibleLeafColumns()
  const rows = table.getRowModel().rows

  if (loading) {
    return (
      <TableBody data-slot="data-table-body">
        {Array.from({ length: loadingRows }, (_, i) => (
          <TableRow key={i} className="hover:bg-transparent">
            {columns.map((column) => (
              <TableCell key={column.id}>
                <Skeleton className="h-4 w-full max-w-40" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    )
  }

  if (rows.length === 0) {
    return (
      <TableBody data-slot="data-table-body">
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={columns.length} className="h-32 text-center whitespace-normal text-muted-foreground">
            {empty ?? "Нет данных"}
          </TableCell>
        </TableRow>
      </TableBody>
    )
  }

  return (
    <TableBody data-slot="data-table-body">
      {rows.map((row) => (
        <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

export { DataTableBody }
