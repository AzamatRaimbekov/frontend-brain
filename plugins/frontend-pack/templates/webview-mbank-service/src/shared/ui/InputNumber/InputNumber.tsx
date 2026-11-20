import { cn } from '@shared/libs/cn'
import { Input } from '@shared/ui/base/input'

import {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  forwardRef,
  useState,
} from 'react'

export type InputNumberSize = 'default' | 'compact'

export type InputNumberProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'onChange' | 'size' | 'value'
> & {
  addSymbol?: string
  defaultValue?: number | null
  error?: boolean
  floatingLabel?: boolean
  inline?: boolean
  onChange?: (value: number | null) => void
  onValueChange?: (value: number | null) => void
  size?: InputNumberSize
  status?: 'error'
  value?: number | null
}

const numberFormatter = new Intl.NumberFormat('ru-RU')

function normalizeValue(value: string) {
  const normalized = value.replace(/\s/g, '').replace(',', '.')

  if (!normalized) return null
  if (!/^-?\d*(\.\d*)?$/.test(normalized)) return undefined

  const number = Number(normalized)
  return Number.isNaN(number) ? undefined : number
}

function formatValue(value: number | null, addSymbol?: string) {
  if (value === null) return ''

  const formatted = numberFormatter.format(value)
  return addSymbol ? `${formatted} ${addSymbol}` : formatted
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      addSymbol,
      className,
      defaultValue = null,
      error = false,
      floatingLabel,
      inline,
      onBlur,
      onChange,
      onFocus,
      onValueChange,
      size = 'default',
      status,
      value,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(
      defaultValue,
    )
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : uncontrolledValue
    const isError = error || status === 'error'
    const displayValue = isFocused
      ? (currentValue?.toString() ?? '')
      : formatValue(currentValue, addSymbol)

    const updateValue = (nextValue: number | null) => {
      if (!isControlled) setUncontrolledValue(nextValue)
      onChange?.(nextValue)
      onValueChange?.(nextValue)
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = normalizeValue(event.currentTarget.value)
      if (nextValue !== undefined) updateValue(nextValue)
    }

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(event)
    }

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(event)
    }

    return (
      <Input
        aria-invalid={isError || undefined}
        className={cn(
          'data-[floating-label=true]:pt-5 data-[floating-label=true]:pb-1 data-[inline=true]:h-5 data-[inline=true]:border-0 data-[inline=true]:bg-transparent data-[inline=true]:p-0 data-[size=compact]:h-12',
          className,
        )}
        data-size={inline ? undefined : size}
        data-floating-label={floatingLabel || undefined}
        data-inline={inline || undefined}
        inputMode="numeric"
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        ref={ref}
        type="text"
        value={displayValue}
        {...props}
      />
    )
  },
)

InputNumber.displayName = 'InputNumber'
