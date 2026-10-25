import { useId } from "react"
import type * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Card } from "@/shared/ui/card"
import { StatusDot, type StatusDotTone } from "./StatusDot"

type BadgeTone = React.ComponentProps<typeof Badge>["tone"]

const scoreVariants = cva("text-3xl font-bold", {
  variants: { tone: { success: "text-success-text", warning: "text-warning-text", error: "text-destructive-text" } },
  defaultVariants: { tone: "warning" },
})

export type ScoreReason = { id: string; text: string; tone?: StatusDotTone }

type ScoreCardProps = {
  title?: string
  score: number
  scoreTone?: "success" | "warning" | "error"
  /** After the score: "из 900 · модель v3.2". */
  scale?: string
  risk?: { label: string; tone: BadgeTone }
  reasons?: ScoreReason[]
  /** Bottom line: "Назначен: Токтосунов Б. · SLA до 14:00". */
  meta?: string
  className?: string
}

/** Figma `Scoring` card: title + risk badge, score 32 bold in the risk colour, bullet reasons, meta. */
export function ScoreCard({ title = "Скоринг", score, scoreTone, scale, risk, reasons = [], meta, className }: ScoreCardProps) {
  const titleId = useId()
  return (
    <Card role="region" aria-labelledby={titleId} data-slot="score-card" className={cn("gap-3 border-transparent p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 id={titleId} className="text-base font-bold text-foreground">
          {title}
        </h2>
        {risk && (
          <Badge size="sm" tone={risk.tone} shape="square" className="rounded-sm">
            {risk.label}
          </Badge>
        )}
      </div>
      <p className="flex items-baseline gap-2">
        <span className={scoreVariants({ tone: scoreTone })}>{score}</span>
        {scale && <span className="text-sm text-muted-foreground">{scale}</span>}
      </p>
      {reasons.length > 0 && (
        <ul className="flex flex-col gap-2">
          {reasons.map((reason) => (
            <li key={reason.id} className="flex items-start gap-2 text-sm text-foreground">
              <StatusDot size="sm" tone={reason.tone ?? "warning"} className="mt-[7px]" />
              {reason.text}
            </li>
          ))}
        </ul>
      )}
      {meta && <p className="text-caption text-muted-foreground">{meta}</p>}
    </Card>
  )
}
