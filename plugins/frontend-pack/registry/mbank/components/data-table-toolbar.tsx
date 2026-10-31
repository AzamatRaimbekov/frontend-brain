import type * as React from "react"
import type { Column, Table as TanstackTable } from "@tanstack/react-table"

import { cn } from "@/shared/lib/utils"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { ColumnsIcon, SearchIcon } from "./icons"
import { Input } from "./input"

type DataTableToolbarProps<TData> = React.ComponentProps<"div"> & {
  table: TanstackTable<TData>
  searchPlaceholder?: string
  /** false hides the search input (filters live elsewhere). */
  searchable?: boolean
  /** false hides the column visibility menu. */
  columnsMenu?: boolean
  columnsLabel?: string
}

/** Column title for the visibility menu: string header, else meta.label, else the column id. */
function columnLabel<TData>(column: Column<TData, unknown>) {
  const { header, meta } = column.columnDef
  if (typeof header === "string") return header
  const label = (meta as { label?: unknown } | undefined)?.label
  return typeof label === "string" ? label : column.id
}

/**
 * Above DataTable: global search (Figma `input/search`, size S), extra filters / actions as
 * children, and the column visibility menu. Works with any TanStack table instance.
 */
function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Поиск",
  searchable = true,
  columnsMenu = true,
  columnsLabel = "Колонки",
  className,
  children,
  ...props
}: DataTableToolbarProps<TData>) {
  const hideable = table.getAllLeafColumns().filter((column) => column.getCanHide())

  return (
    <div data-slot="data-table-toolbar" className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      {searchable && (
        <div className="relative w-full max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            size="sm"
            value={String(table.getState().globalFilter ?? "")}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}
      {children}
      {columnsMenu && hideable.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <ColumnsIcon />
              {columnsLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{columnsLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hideable.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                onSelect={(event) => event.preventDefault()}
              >
                {columnLabel(column)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export { DataTableToolbar }
export type { DataTableToolbarProps }
