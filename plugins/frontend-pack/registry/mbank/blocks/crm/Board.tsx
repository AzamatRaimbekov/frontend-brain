import { Children } from "react"
import type * as React from "react"

import { cn } from "@/shared/lib/utils"

type BoardProps = {
  /** <BoardColumn /> elements, one per pipeline stage. */
  children: React.ReactNode
  label?: string
  className?: string
}

/**
 * Figma `Board`: stage columns side by side with 12px gaps. Wide screens fit 5 columns
 * (min 200px); narrower ones scroll horizontally with snap, one column ≈ 85% of the screen on phones.
 */
export function Board({ children, label = "Этапы", className }: BoardProps) {
  return (
    <ul
      aria-label={label}
      data-slot="board"
      className={cn(
        "grid snap-x snap-mandatory auto-cols-[minmax(260px,85%)] grid-flow-col gap-3 overflow-x-auto pb-2",
        "md:auto-cols-[minmax(240px,1fr)] xl:auto-cols-[minmax(200px,1fr)]",
        className,
      )}
    >
      {Children.map(children, (column) => (
        <li className="min-w-0 snap-start">{column}</li>
      ))}
    </ul>
  )
}
