import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { cn } from '@shared/libs/cn'

export type RadioSize = 'sm' | 'md' | 'lg'

export type RadioProps<Value = unknown> = Omit<
  RadioPrimitive.Root.Props<Value>,
  'className'
> & {
  className?: string
  size?: RadioSize
}

export type RadioGroupProps<Value = unknown> = Omit<
  RadioGroupPrimitive.Props<Value>,
  'className' | 'onValueChange'
> & {
  className?: string
  onChange?: (value: Value) => void
  onValueChange?: RadioGroupPrimitive.Props<Value>['onValueChange']
}

function Radio<Value>({ className, size = 'md', ...props }: RadioProps<Value>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio"
      data-size={size}
      className={cn(
        'group/radio inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-input bg-transparent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-checked:border-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[size=lg]:size-6 data-[size=md]:size-5 data-[size=sm]:size-4',
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="flex items-center justify-center">
        <span className="rounded-full bg-primary group-data-[size=lg]/radio:size-3 group-data-[size=md]/radio:size-2.5 group-data-[size=sm]/radio:size-2" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

function RadioGroup<Value>({
  className,
  onChange,
  onValueChange,
  ...props
}: RadioGroupProps<Value>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('flex flex-col gap-3', className)}
      onValueChange={(value, eventDetails) => {
        onValueChange?.(value, eventDetails)
        onChange?.(value)
      }}
      {...props}
    />
  )
}

export { Radio, RadioGroup }
