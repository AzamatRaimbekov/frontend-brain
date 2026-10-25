import { useId } from "react"
import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Card } from "@/shared/ui/card"

type KeyValueSectionProps = {
  title: string
  /** <KeyValueRow /> elements. */
  children: React.ReactNode
  /** Button or link on the right of the title (Изменить). */
  action?: React.ReactNode
  className?: string
}

/** Figma cards Заёмщик / Параметры кредита / Документы: p 20, title 16 bold, rows below. */
export function KeyValueSection({ title, children, action, className }: KeyValueSectionProps) {
  const titleId = useId()
  return (
    <Card
      data-slot="key-value-section"
      aria-labelledby={titleId}
      role="region"
      className={cn("gap-2 border-transparent p-5", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id={titleId} className="text-base font-bold text-foreground">
          {title}
        </h2>
        {action}
      </div>
      <dl className="flex flex-col">{children}</dl>
    </Card>
  )
}
