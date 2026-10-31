import { useState } from "react"
import type * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type TableOptions,
  type VisibilityState,
} from "@tanstack/react-table"

import { cn } from "@/shared/lib/utils"
import { DataTableBody } from "./data-table-body"
import { DataTableToolbar } from "./data-table-toolbar"
import { Pagination } from "./pagination"
import { Table, TableHead, TableHeader, TableRow } from "./table"

/*
 * CRM `TableSection 2.0` as a shadcn data table on @tanstack/react-table: sorting
 * (DataTableColumnHeader), global search and column visibility (DataTableToolbar), row selection
 * (dataTableSelectColumn), Skeleton rows while loading, an empty slot and the kit Pagination.
 * Server-side data: pass tableOptions { manualPagination, rowCount, state, on*Change }.
 */
type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Shows Skeleton rows instead of data (first load). */
  loading?: boolean
  loadingRows?: number
  /** Rendered in one full-width cell when there are no rows, e.g. <EmptyState />. */
  empty?: React.ReactNode
  /** Toolbar above the table; default = search + column menu. Pass null to hide it. */
  toolbar?: ((table: TanstackTable<TData>) => React.ReactNode) | null
  searchPlaceholder?: string
  /** false hides the pagination row (short lists). */
  paginated?: boolean
  pageSizeOptions?: number[]
  initialPageSize?: number
  /** Stable id for row selection, e.g. (row) => row.id. */
  getRowId?: (row: TData, index: number) => string
  /** Escape hatch for every other TanStack option (controlled state, manual pagination ...). */
  tableOptions?: Partial<TableOptions<TData>>
  className?: string
  "aria-label"?: string
}

function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  loadingRows = 5,
  empty,
  toolbar,
  searchPlaceholder,
  paginated = true,
  pageSizeOptions,
  initialPageSize = 20,
  getRowId,
  tableOptions,
  className,
  "aria-label": ariaLabel,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: initialPageSize })

  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginated ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    ...tableOptions,
    state: { sorting, globalFilter, columnVisibility, rowSelection, pagination, ...tableOptions?.state },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const rowCount = table.getRowCount()
  const from = rowCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, rowCount)

  return (
    <div data-slot="data-table" className={cn("flex flex-col gap-4", className)}>
      {toolbar === undefined ? <DataTableToolbar table={table} searchPlaceholder={searchPlaceholder} /> : toolbar?.(table)}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table aria-label={ariaLabel} aria-busy={loading || undefined}>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <DataTableBody table={table} loading={loading} loadingRows={loadingRows} empty={empty} />
        </Table>
      </div>
      {paginated && (
        <Pagination
          page={pageIndex + 1}
          pageCount={table.getPageCount()}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={(size) => table.setPageSize(size)}
          summary={rowCount > 0 ? `${from}–${to} из ${rowCount}` : undefined}
        />
      )}
    </div>
  )
}

export { DataTable }
export type { DataTableProps }
