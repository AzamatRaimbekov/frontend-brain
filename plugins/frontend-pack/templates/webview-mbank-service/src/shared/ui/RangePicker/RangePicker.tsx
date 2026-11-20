import { cn } from '@shared/libs/cn'
import { Slider, type SliderProps } from '@shared/ui/base/slider'

export type RangePickerValue = number | [number, number]

export type RangePickerProps<Value extends RangePickerValue = number> = Omit<
  SliderProps,
  'defaultValue' | 'onValueChange' | 'onValueCommitted' | 'value'
> & {
  defaultValue?: Value
  onValueChange?: (value: Value) => void
  onValueCommitted?: (value: Value) => void
  value?: Value
}

export function RangePicker<Value extends RangePickerValue = number>({
  className,
  defaultValue,
  min = 0,
  max = 100,
  onValueChange,
  onValueCommitted,
  value,
  ...props
}: RangePickerProps<Value>) {
  const initialValue = defaultValue ?? min

  return (
    <Slider
      className={cn('min-h-6', className)}
      defaultValue={initialValue as SliderProps['defaultValue']}
      max={max}
      min={min}
      value={value}
      onValueChange={(nextValue) => {
        onValueChange?.(nextValue as Value)
      }}
      onValueCommitted={(nextValue) => {
        onValueCommitted?.(nextValue as Value)
      }}
      {...props}
    />
  )
}
