import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Card } from "@/shared/ui/card"

type BadgeTone = React.ComponentProps<typeof Badge>["tone"]

type SummaryHeaderProps = {
  /** Page h1: "Заявка CL-240118". */
  title: string
  status?: { label: string; tone: BadgeTone }
  /** Big number: "450 000 KGS". */
  amount?: string
  /** "Потребительский · 24 мес · 21,5% годовых · подана 12.10.2026, 09:14 · приложение". */
  context?: string
  /** Buttons, Figma order: Отклонить (destructive) / Запросить документы / Одобрить (primary). */
  actions?: React.ReactNode
  /** For focus management after an action (react-ux): tabIndex=-1 is set. */
  titleRef?: React.Ref<HTMLHeadingElement>
  className?: string
}

/** Figma `Summary` card (p 20): title 20 bold + status badge, amount 32 bold, context 14 muted, actions. */
export function SummaryHeader({ title, status, amount, context, actions, titleRef, className }: SummaryHeaderProps) {
  return (
    <Card
      data-slot="summary-header"
      className={cn("gap-6 border-transparent p-5 md:flex-row md:items-center md:justify-between", className)}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 ref={titleRef} tabIndex={-1} className="text-xl font-bold text-foreground outline-none">
            {title}
          </h1>
          {status && (
            <Badge tone={status.tone} shape="square" className="rounded-sm">
              {status.label}
            </Badge>
          )}
        </div>
        {amount && <p className="text-3xl font-bold text-foreground">{amount}</p>}
        {context && <p className="text-sm text-muted-foreground">{context}</p>}
      </div>
      {actions && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap md:shrink-0 md:justify-end">{actions}</div>
      )}
    </Card>
  )
}
