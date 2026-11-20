import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { cn } from '@shared/libs/cn'
import { ChevronDownIcon } from 'lucide-react'

type AccordionProps = Omit<AccordionPrimitive.Root.Props, 'className'> & {
  className?: string
}

type AccordionItemProps = Omit<AccordionPrimitive.Item.Props, 'className'> & {
  className?: string
}

type AccordionTriggerProps = Omit<
  AccordionPrimitive.Trigger.Props,
  'className'
> & {
  className?: string
}

type AccordionContentProps = Omit<
  AccordionPrimitive.Panel.Props,
  'className'
> & {
  className?: string
}

function Accordion({ className, ...props }: AccordionProps) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col gap-3', className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('overflow-hidden rounded-[20px] bg-card', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger relative flex min-h-14 flex-1 items-center justify-between gap-3 rounded-[20px] border border-transparent px-4 py-3 text-left text-sm font-medium text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/30 aria-disabled:pointer-events-none aria-disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          className="pointer-events-none size-5 shrink-0 text-primary transition-transform group-aria-expanded/accordion-trigger:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden px-4 pb-4 text-sm"
      {...props}
    >
      <div
        className={cn(
          'h-(--accordion-panel-height) rounded-2xl bg-secondary p-3 text-sm leading-5 text-muted-foreground data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
export type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionProps,
  AccordionTriggerProps,
}
