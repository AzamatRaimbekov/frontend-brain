import { Children, useId } from "react"
import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"

type BoardColumnProps = {
  title: string
  /** Total in the stage (the badge), may be larger than the cards shown. */
  count: number
  /** Line under the title: "SLA этапа 15 мин". */
  sla?: string
  /** <ApplicationCard /> elements. */
  children?: React.ReactNode
  /** <ShowMore /> under the cards. */
  footer?: React.ReactNode
  emptyText?: string
  className?: string
}

/** Figma `Column <stage>`: header 48 (name 16 bold + count badge, SLA caption), cards 8px apart. */
export function BoardColumn({ title, count, sla, children, footer, emptyText = "Нет заявок", className }: BoardColumnProps) {
  const titleId = useId()
  const cards = Children.toArray(children)
  return (
    <section aria-labelledby={titleId} data-slot="board-column" className={cn("flex flex-col gap-2", className)}>
      <header className="flex h-12 flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 id={titleId} className="truncate text-base font-bold text-foreground">
            {title}
          </h3>
          <Badge size="sm" tone="neutral" aria-label={`${count} заявок`}>
            {count}
          </Badge>
        </div>
        {sla && <p className="truncate text-caption text-muted-foreground">{sla}</p>}
      </header>
      {cards.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {cards.map((card, index) => (
            <li key={index}>{card}</li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-border-secondary px-3 py-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      )}
      {footer}
    </section>
  )
}
