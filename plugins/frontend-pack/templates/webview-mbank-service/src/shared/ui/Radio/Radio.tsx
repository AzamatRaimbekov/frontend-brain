import { cn } from '@shared/libs/cn'
import {
  Radio as BaseRadio,
  RadioGroup as BaseRadioGroup,
  RadioGroupProps as BaseRadioGroupProps,
  RadioProps as BaseRadioProps,
} from '@shared/ui/base/radio'

import { ReactNode } from 'react'

export type RadioProps<Value = unknown> = BaseRadioProps<Value> & {
  children?: ReactNode
  labelPosition?: 'left' | 'right'
}

export type RadioGroupProps<Value = unknown> = BaseRadioGroupProps<Value>

export function Radio<Value>({
  children,
  className,
  labelPosition = 'right',
  ...props
}: RadioProps<Value>) {
  if (!children) {
    return (
      <BaseRadio
        className={className}
        {...props}
      />
    )
  }

  const control = <BaseRadio {...props} />

  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-3',
        labelPosition === 'left' && 'flex-row-reverse justify-end',
        className,
      )}
    >
      {control}
      <span>{children}</span>
    </label>
  )
}

export function RadioGroup<Value>(props: RadioGroupProps<Value>) {
  return <BaseRadioGroup {...props} />
}
