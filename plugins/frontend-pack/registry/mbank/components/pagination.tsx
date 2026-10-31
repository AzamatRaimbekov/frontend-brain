import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"
import { ChevronLeftIcon, ChevronRightIcon } from "./icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

/*
 * Figma `pagination/basic` (type basic / more pages, size l/m/s, align left/center/right),
 * `item/pagintaion / buttons` (Type number / arrow, Selected, disabled) and
 * `item/pagination/page/dropdown` (page size). Controlled: the parent owns page (1-based) and pageSize.
 * TODO: confirm item heights against the Pagination frame (kit: lg 40 / md 36 / sm 32).
 */
// @contract pagination start
const paginationItemVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-sm font-medium tabular-nums text-foreground transition-colors outline-none select-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:text-disabled-foreground aria-[current=page]:bg-secondary aria-[current=page]:text-secondary-foreground [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-8 min-w-8 px-1.5 text-xs",
        md: "h-9 min-w-9 px-2 text-sm",
        lg: "h-10 min-w-10 px-2.5 text-sm",
      },
    },
    defaultVariants: { size: "md" },
  },
)
// @contract pagination end

const alignClasses = { left: "justify-start", center: "justify-center", right: "justify-end" } as const

type PageItem = number | "ellipsis-start" | "ellipsis-end"

/** Page numbers with ellipses: 1 … 4 5 6 … 20. siblingCount pages on each side of the current one. */
function getPaginationRange(page: number, pageCount: number, siblingCount = 1): PageItem[] {
  const total = siblingCount * 2 + 5
  if (pageCount <= total) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const start = Math.max(page - siblingCount, 2)
  const end = Math.min(page + siblingCount, pageCount - 1)
  const showStart = start > 3
  const showEnd = end < pageCount - 2
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
  if (!showStart) return [...range(1, total - 2), "ellipsis-end", pageCount]
  if (!showEnd) return [1, "ellipsis-start", ...range(pageCount - (total - 3), pageCount)]
  return [1, "ellipsis-start", ...range(start, end), "ellipsis-end", pageCount]
}

type PaginationProps = Omit<React.ComponentProps<"nav">, "onChange"> &
  VariantProps<typeof paginationItemVariants> & {
    /** Current page, 1-based. */
    page: number
    pageCount: number
    onPageChange: (page: number) => void
    /** With onPageSizeChange shows the page-size select (`item/pagination/page/dropdown`). */
    pageSize?: number
    pageSizeOptions?: number[]
    onPageSizeChange?: (pageSize: number) => void
    align?: keyof typeof alignClasses
    siblingCount?: number
    /** Text on the left, e.g. "1–20 из 250". */
    summary?: React.ReactNode
    labels?: { nav?: string; previous?: string; next?: string; page?: (page: number) => string; pageSize?: string }
  }

function Pagination({
  className,
  page,
  pageCount,
  onPageChange,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  size = "md",
  align = "right",
  siblingCount = 1,
  summary,
  labels,
  ...props
}: PaginationProps) {
  const pages = Math.max(pageCount, 1)
  const current = Math.min(Math.max(page, 1), pages)
  const item = paginationItemVariants({ size })
  const go = (next: number) => next !== current && next >= 1 && next <= pages && onPageChange(next)

  return (
    <nav
      data-slot="pagination"
      aria-label={labels?.nav ?? "Страницы"}
      className={cn("flex w-full flex-wrap items-center gap-x-4 gap-y-2", alignClasses[align], className)}
      {...props}
    >
      {summary && <p className="mr-auto text-sm text-muted-foreground">{summary}</p>}
      {onPageSizeChange && pageSize !== undefined && (
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger size="sm" aria-label={labels?.pageSize ?? "Строк на странице"} className="w-auto gap-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <ul className="flex items-center gap-1">
        <li>
          <button type="button" className={item} disabled={current <= 1} onClick={() => go(current - 1)} aria-label={labels?.previous ?? "Предыдущая страница"}>
            <ChevronLeftIcon />
          </button>
        </li>
        {getPaginationRange(current, pages, siblingCount).map((p) =>
          typeof p === "number" ? (
            <li key={p}>
              <button
                type="button"
                className={item}
                aria-current={p === current ? "page" : undefined}
                aria-label={labels?.page?.(p) ?? `Страница ${p}`}
                onClick={() => go(p)}
              >
                {p}
              </button>
            </li>
          ) : (
            <li key={p} aria-hidden="true" className={cn(item, "pointer-events-none text-muted-foreground")}>
              …
            </li>
          ),
        )}
        <li>
          <button type="button" className={item} disabled={current >= pages} onClick={() => go(current + 1)} aria-label={labels?.next ?? "Следующая страница"}>
            <ChevronRightIcon />
          </button>
        </li>
      </ul>
    </nav>
  )
}

export { Pagination, paginationItemVariants, getPaginationRange }
export type { PaginationProps, PageItem }
