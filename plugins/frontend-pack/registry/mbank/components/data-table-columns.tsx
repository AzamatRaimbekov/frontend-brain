import type * as React from "react"
import type { Column, ColumnDef } from "@tanstack/react-table"

import { cn } from "@/shared/lib/utils"
import { Checkbox } from "./checkbox"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "./icons"

type DataTableColumnHeaderProps<TData, TValue> = React.ComponentProps<"div"> & {
  column: Column<TData, TValue>
  title: string
}

/**
 * CRM `item/table-cell/header/sorter`: Sort order inactive / ↑ ascending / ↓ descending.
 * Click cycles asc -> desc -> off (TanStack starts number columns with desc); aria-sort is on the <th>.
 */
function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) return <div className={className} {...props}>{title}</div>

  const sorted = column.getIsSorted()
  const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ChevronsUpDownIcon
  return (
    <div data-slot="data-table-column-header" className={cn("flex items-center", className)} {...props}>
      <button
        type="button"
        onClick={column.getToggleSortingHandler()}
        className="-mx-1.5 inline-flex h-8 items-center gap-1 rounded-sm px-1.5 font-medium transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 data-[sorted=true]:text-foreground"
        data-sorted={Boolean(sorted)}
      >
        {title}
        <Icon className="size-4 shrink-0" aria-hidden="true" />
      </button>
    </div>
  )
}

/** Leading checkbox column: select the page in the header, a row in each cell. */
function dataTableSelectColumn<TData>(labels: { all?: string; row?: string } = {}): ColumnDef<TData> {
  return {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
        aria-label={labels.all ?? "Выбрать все строки"}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label={labels.row ?? "Выбрать строку"}
      />
    ),
  }
}

export { DataTableColumnHeader, dataTableSelectColumn }
export type { DataTableColumnHeaderProps }
