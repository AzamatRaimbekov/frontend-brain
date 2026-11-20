import { cn } from '@shared/libs/cn'
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/base/tabs'

import { ReactNode } from 'react'

export type SegmentedValue = string | number
export type SegmentedSize = 'sm' | 'md' | 'lg'

export interface SegmentedOption {
  className?: string
  disabled?: boolean
  label: ReactNode
  value: SegmentedValue
}

export interface SegmentedProps {
  block?: boolean
  className?: string
  disabled?: boolean
  itemClassName?: string
  onChange?: (value: SegmentedValue) => void
  options: SegmentedOption[]
  size?: SegmentedSize
  value?: SegmentedValue
}

export function Segmented({
  block,
  className,
  disabled,
  itemClassName,
  onChange,
  options,
  size = 'md',
  value,
}: SegmentedProps) {
  const currentValue =
    value ?? options.find((option) => !option.disabled)?.value

  return (
    <Tabs
      value={currentValue}
      className={cn(block && 'w-full', className)}
      onValueChange={(nextValue) => {
        onChange?.(nextValue as SegmentedValue)
      }}
    >
      <TabsList
        size={size}
        className={cn(block && 'w-full')}
      >
        {options.map((option) => (
          <TabsTrigger
            className={cn(itemClassName, option.className)}
            disabled={disabled || option.disabled}
            key={option.value}
            value={option.value}
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
