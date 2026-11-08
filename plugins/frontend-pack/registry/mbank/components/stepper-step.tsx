import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/*
 * Stepper step (Figma `item-stepper-basic`). Generated from the contract
 * registry/mbank/contracts/stepper-step.json by contract-to-code --new (template card-like).
 * Change the look in the contract and run contract-to-code --write; the block between the markers is generated.
 * Accessibility: see the component comment below.
 */
// @contract stepper-step start
const stepperStepVariants = cva(
  "items-center gap-2 py-2 text-base text-foreground *:data-[slot=stepper-step-marker]:size-8 *:data-[slot=stepper-step-marker]:rounded-full *:data-[slot=stepper-step-marker]:items-center **:data-[slot=stepper-step-number]:text-sm **:data-[slot=stepper-step-number]:font-medium inline-flex min-w-0 *:data-[slot=stepper-step-marker]:inline-flex *:data-[slot=stepper-step-marker]:shrink-0 *:data-[slot=stepper-step-marker]:justify-center",
  {
    variants: {
      status: {
        done: "*:data-[slot=stepper-step-marker]:bg-status-success-muted **:data-[slot=stepper-step-number]:text-status-success",
        current: "font-medium *:data-[slot=stepper-step-marker]:bg-status-success **:data-[slot=stepper-step-number]:text-static-light",
        upcoming: "text-muted-foreground *:data-[slot=stepper-step-marker]:bg-soft **:data-[slot=stepper-step-number]:text-muted-foreground",
      },
    },
    defaultVariants: { status: "upcoming" },
  },
)
// @contract stepper-step end

type StepperStepProps = Omit<React.ComponentProps<"li">, "children"> &
  VariantProps<typeof stepperStepVariants> & {
    number: React.ReactNode
    label: React.ReactNode
    description?: React.ReactNode
  }

const statusText = { done: "пройден", current: "текущий шаг", upcoming: "впереди" } as const

/** One step of a stepper: numbered circle, label, optional description. Put steps in an <ol>. */
function StepperStep({ className, status = "upcoming", number, label, description, ...props }: StepperStepProps) {
  return (
    <li
      data-slot="stepper-step"
      aria-current={status === "current" ? "step" : undefined}
      className={cn(stepperStepVariants({ status }), className)}
      {...props}
    >
      <span data-slot="stepper-step-marker" aria-hidden="true">
        <span data-slot="stepper-step-number">{number}</span>
      </span>
      <span data-slot="stepper-step-label" className="truncate">
        {label}
        <span className="sr-only">, {statusText[status ?? "upcoming"]}</span>
      </span>
      {description && (
        <span data-slot="stepper-step-description" className="truncate text-caption text-muted-foreground">
          {description}
        </span>
      )}
    </li>
  )
}

export { StepperStep, stepperStepVariants }
