import { cn } from '@shared/libs/cn'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Accordion as BaseAccordion,
} from '@shared/ui/base/accordion'

import { ReactNode } from 'react'

export type AccordionValue = string
export type AccordionType = 'single' | 'multiple'

export interface AccordionEntry {
  className?: string
  content: ReactNode
  contentClassName?: string
  disabled?: boolean
  title: ReactNode
  triggerClassName?: string
  value: AccordionValue
}

export interface AccordionProps {
  className?: string
  contentClassName?: string
  defaultValue?: AccordionValue | AccordionValue[]
  disabled?: boolean
  itemClassName?: string
  items: AccordionEntry[]
  onValueChange?: (value: AccordionValue | AccordionValue[]) => void
  triggerClassName?: string
  type?: AccordionType
  value?: AccordionValue | AccordionValue[]
}

const toArrayValue = (value?: AccordionValue | AccordionValue[]) => {
  if (!value) {
    return undefined
  }

  return Array.isArray(value) ? value : [value]
}

const fromArrayValue = (
  value: AccordionValue[],
  type: AccordionType,
): AccordionValue | AccordionValue[] => {
  if (type === 'single') {
    return value[0] ?? ''
  }

  return value
}

export function Accordion({
  className,
  contentClassName,
  defaultValue,
  disabled,
  itemClassName,
  items,
  onValueChange,
  triggerClassName,
  type = 'multiple',
  value,
}: AccordionProps) {
  return (
    <BaseAccordion
      multiple={type === 'multiple'}
      className={className}
      defaultValue={toArrayValue(defaultValue)}
      disabled={disabled}
      value={toArrayValue(value)}
      onValueChange={(nextValue) => {
        onValueChange?.(fromArrayValue(nextValue as AccordionValue[], type))
      }}
    >
      {items.map((item) => (
        <AccordionItem
          className={cn(itemClassName, item.className)}
          disabled={disabled || item.disabled}
          key={item.value}
          value={item.value}
        >
          <AccordionTrigger
            className={cn(triggerClassName, item.triggerClassName)}
          >
            {item.title}
          </AccordionTrigger>
          <AccordionContent
            className={cn(contentClassName, item.contentClassName)}
          >
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </BaseAccordion>
  )
}
