import { cn } from "@/shared/lib/utils"
import { Card } from "@/shared/ui/card"
import { StageStep, type StageState } from "./StageStep"

export type StageItem = { id: string; title: string; state: StageState; meta?: string }

type StageStepperProps = {
  stages: StageItem[]
  label?: string
  className?: string
}

/**
 * Figma `Stages` (80px card, p 20, equal columns with 16px gaps): done green, current orange,
 * upcoming grey, failed red. Vertical list on phones.
 */
export function StageStepper({ stages, label = "Этапы заявки", className }: StageStepperProps) {
  return (
    <Card data-slot="stage-stepper" className={cn("border-transparent p-5", className)}>
      <ol
        aria-label={label}
        className="grid gap-3 sm:grid-flow-col sm:auto-cols-fr sm:gap-4"
      >
        {stages.map((stage) => (
          <StageStep key={stage.id} title={stage.title} state={stage.state} meta={stage.meta} />
        ))}
      </ol>
    </Card>
  )
}
