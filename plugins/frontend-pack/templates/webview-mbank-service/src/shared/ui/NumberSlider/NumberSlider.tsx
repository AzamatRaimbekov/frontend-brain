import { cn } from '@shared/libs/cn'
import { InputNumber, InputNumberProps } from '@shared/ui/InputNumber'
import { RangePicker } from '@shared/ui/RangePicker'

import { ReactNode, forwardRef, useState } from 'react'

export type NumberSliderProps = Omit<
  InputNumberProps,
  'className' | 'defaultValue' | 'max' | 'min' | 'onChange' | 'step' | 'value'
> & {
  className?: string
  defaultValue?: number | null
  inputClassName?: string
  max?: number
  min?: number
  onChange?: (value: number | null) => void
  onValueCommitted?: (value: number) => void
  step?: number
  sliderLabel?: ReactNode
  value?: number | null
  view?: 'default' | 'card'
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export const NumberSlider = forwardRef<HTMLInputElement, NumberSliderProps>(
  (
    {
      className,
      defaultValue = null,
      inputClassName,
      max = 100,
      min = 0,
      onChange,
      onValueCommitted,
      sliderLabel,
      step = 1,
      value,
      view = 'default',
      ...props
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(
      defaultValue,
    )
    const isControlled = value !== undefined
    const fieldValue = isControlled ? value : uncontrolledValue
    const sliderValue = clamp(fieldValue ?? min, min, max)
    const isCard = view === 'card'

    const updateValue = (nextValue: number | null) => {
      const boundedValue =
        nextValue === null ? null : clamp(nextValue, min, max)

      if (!isControlled) setUncontrolledValue(boundedValue)
      onChange?.(boundedValue)
    }

    return (
      <div
        className={cn(
          'flex w-full flex-col gap-2',
          isCard && 'rounded-xl bg-card px-3 pt-2 pb-3',
          className,
        )}
      >
        {sliderLabel && (
          <span className="text-xs leading-4 font-medium text-muted-foreground">
            {sliderLabel}
          </span>
        )}
        <InputNumber
          {...props}
          className={cn(
            isCard &&
              'rounded-none text-sm leading-5 font-semibold focus:border-0',
            inputClassName,
          )}
          inline={isCard}
          max={max}
          min={min}
          onChange={updateValue}
          ref={ref}
          step={step}
          value={fieldValue}
        />
        <RangePicker
          aria-label={typeof sliderLabel === 'string' ? sliderLabel : undefined}
          className="w-full"
          max={max}
          min={min}
          onValueChange={updateValue}
          onValueCommitted={onValueCommitted}
          step={step}
          value={sliderValue}
        />
      </div>
    )
  },
)

NumberSlider.displayName = 'NumberSlider'
