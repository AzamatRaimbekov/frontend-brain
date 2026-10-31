import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Accordion as AccordionPrimitive } from "radix-ui"

import { cn } from "@/shared/lib/utils"
import { ChevronDownIcon } from "./icons"

/*
 * Figma `accordion`, `Item  / accordion / states` (selected off/on = closed/open),
 * `Item / accordion / header` (default / hover / active) and `item / accordion / bottomInfo`.
 * variant="card" = FAQ look (`item-faq`): every item is a surface-1 card. Set variant on Accordion.
 */
const accordionVariants = cva("group/accordion flex w-full flex-col", {
  variants: {
    variant: {
      line: "",
      card: "gap-2",
    },
  },
  defaultVariants: { variant: "line" },
})

type AccordionProps = React.ComponentProps<typeof AccordionPrimitive.Root> & VariantProps<typeof accordionVariants>

function Accordion({ className, variant = "line", ...props }: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      data-variant={variant}
      className={cn(accordionVariants({ variant }), className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "group-data-[variant=line]/accordion:border-b group-data-[variant=line]/accordion:border-border group-data-[variant=line]/accordion:last:border-b-0",
        "group-data-[variant=card]/accordion:rounded-lg group-data-[variant=card]/accordion:bg-surface-1 group-data-[variant=card]/accordion:px-4",
        className,
      )}
      {...props}
    />
  )
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center justify-between gap-4 rounded-sm py-4 text-left text-md font-medium text-foreground transition-colors outline-none hover:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:text-disabled-foreground [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none"
      {...props}
    >
      <div className={cn("pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, accordionVariants }
