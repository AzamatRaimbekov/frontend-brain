import { cn } from '@shared/libs/cn'
import {
  Checkbox as BaseCheckbox,
  CheckboxProps as BaseCheckboxProps,
} from '@shared/ui/base/checkbox'

import { ReactNode } from 'react'

export type CheckboxProps = BaseCheckboxProps & {
  alignSelf?: 'center' | 'start' | 'end'
  children?: ReactNode
}

export function Checkbox({
  alignSelf = 'center',
  children,
  className,
  ...props
}: CheckboxProps) {
  if (!children) {
    return (
      <BaseCheckbox
        className={cn(`self-${alignSelf}`, className)}
        {...props}
      />
    )
  }

  return (
    <label
      className={cn(
        `inline-flex cursor-pointer items-center gap-3 self-${alignSelf}`,
        className,
      )}
    >
      <BaseCheckbox {...props} />
      <span>{children}</span>
    </label>
  )
}
