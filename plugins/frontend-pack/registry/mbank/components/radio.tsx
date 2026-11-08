import type * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/*
 * Radio (Figma `Switchers - Check`). Generated from the contract
 * registry/mbank/contracts/radio.json by contract-to-code --new (template button-like).
 * Change the look in the contract and run contract-to-code --write; the block between the markers is generated.
 * Accessibility: see the component comment below.
 */
// @contract radio start
const radioVariants = cva(
  "size-5 rounded-full border border-input bg-background items-center hover:border-input-hover disabled:border-input-disabled disabled:bg-muted data-[state=checked]:border-brand data-[state=checked]:bg-brand focus-visible:ring-[3px] focus-visible:ring-ring/30 peer inline-flex shrink-0 justify-center transition-colors outline-none disabled:cursor-not-allowed disabled:data-[state=checked]:opacity-50",
)
// @contract radio end

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />
}

/** Figma `Switchers - Check` Type=Radiobutton: one option of a RadioGroup; pair it with <Label htmlFor>. */
function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item data-slot="radio" className={cn(radioVariants(), className)} {...props}>
      <RadioGroupPrimitive.Indicator data-slot="radio-dot" className="size-2 rounded-full bg-brand-foreground" />
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem, radioVariants }
