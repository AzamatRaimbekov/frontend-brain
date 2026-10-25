import { useId } from "react"
import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Card } from "@/shared/ui/card"

type TimelineProps = {
  title: string
  /** <TimelineItem /> elements, newest first. */
  children: React.ReactNode
  /** Shown instead of the list when there are no items. */
  empty?: React.ReactNode
  className?: string
}

/** Figma `History` card (История заявки): title 16 bold, items 12px apart. */
export function Timeline({ title, children, empty, className }: TimelineProps) {
  const titleId = useId()
  const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children)
  return (
    <Card
      role="region"
      aria-labelledby={titleId}
      data-slot="timeline"
      className={cn("gap-3 border-transparent p-5", className)}
    >
      <h2 id={titleId} className="text-base font-bold text-foreground">
        {title}
      </h2>
      {hasItems ? <ol className="flex flex-col gap-3">{children}</ol> : empty}
    </Card>
  )
}
