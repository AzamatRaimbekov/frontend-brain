import { cn } from '@shared/libs/cn'

import {
  ComponentType,
  ReactElement,
  cloneElement,
  useId,
  useState,
} from 'react'

interface ControlProps {
  'aria-label'?: string
  defaultValue?: unknown
  floatingLabel?: boolean
  id?: string
  onBlur?: (...args: unknown[]) => void
  onChange?: (...args: unknown[]) => void
  onFocus?: (...args: unknown[]) => void
  value?: unknown
}

export type FloatingLabelProps = ControlProps & {
  children: ReactElement
  className?: string
  label: string
  labelClassName?: string
}

function hasValue(value: unknown) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.length > 0
  if (Array.isArray(value)) return value.length > 0

  return true
}

function getChangeValue(args: unknown[]) {
  const [value] = args

  if (
    value &&
    typeof value === 'object' &&
    'target' in value &&
    value.target &&
    typeof value.target === 'object' &&
    'value' in value.target
  ) {
    return value.target.value
  }

  return value
}

function isTextareaControl(control: ReactElement<ControlProps>) {
  if (control.type === 'textarea') return true
  if (typeof control.type === 'string') return false

  const component = control.type as ComponentType & {
    displayName?: string
    name?: string
  }

  return component.displayName === 'Textarea' || component.name === 'Textarea'
}

export function FloatingLabel({
  children,
  className,
  defaultValue,
  id,
  label,
  labelClassName,
  onBlur,
  onChange,
  onFocus,
  value,
}: FloatingLabelProps) {
  const generatedId = useId()
  const control = children as ReactElement<ControlProps>
  const childProps = control.props
  const controlId = id ?? childProps.id ?? generatedId
  const controlledValue = value ?? childProps.value
  const [isFocused, setIsFocused] = useState(false)
  const [uncontrolledValue, setUncontrolledValue] = useState(
    childProps.defaultValue ?? defaultValue,
  )
  const isFilled = hasValue(
    controlledValue === undefined ? uncontrolledValue : controlledValue,
  )
  const isFloating = isFocused || isFilled
  const isTextarea = isTextareaControl(control)

  const enhancedChild = cloneElement(control, {
    'aria-label': childProps['aria-label'] ?? label,
    floatingLabel: true,
    id: controlId,
    onBlur: (...args: unknown[]) => {
      childProps.onBlur?.(...args)
      onBlur?.(...args)
      setIsFocused(false)
    },
    onChange: (...args: unknown[]) => {
      childProps.onChange?.(...args)
      onChange?.(...args)
      setUncontrolledValue(getChangeValue(args))
    },
    onFocus: (...args: unknown[]) => {
      childProps.onFocus?.(...args)
      onFocus?.(...args)
      setIsFocused(true)
    },
    value: value ?? childProps.value,
  } as Partial<ControlProps>)

  return (
    <div className={cn('relative', className)}>
      {enhancedChild}
      <label
        className={cn(
          'pointer-events-none absolute left-4 z-1 text-input transition-all duration-150',
          isFloating
            ? 'top-2 text-xs leading-4'
            : isTextarea
              ? 'top-4 text-base leading-5'
              : 'top-1/2 -translate-y-1/2 text-base leading-5',
          isTextarea && 'max-w-[calc(100%-32px)] bg-card',
          labelClassName,
        )}
        htmlFor={controlId}
      >
        {label}
      </label>
    </div>
  )
}

export const FloatLabel = FloatingLabel
