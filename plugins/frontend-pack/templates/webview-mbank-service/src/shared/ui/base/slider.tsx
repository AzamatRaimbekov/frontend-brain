import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import { cn } from '@shared/libs/cn'

export type SliderProps = Omit<SliderPrimitive.Root.Props, 'className'> & {
  className?: string
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderProps) {
  const values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [value ?? defaultValue ?? min]

  return (
    <SliderPrimitive.Root
      className={cn('data-horizontal:w-full data-vertical:h-full', className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex h-6 w-full touch-none items-center select-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="absolute top-1/2 h-1 w-full -translate-y-1/2 overflow-hidden rounded-full bg-muted select-none data-vertical:h-full data-vertical:w-1"
          style={{ position: 'absolute' }}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="relative block size-6 shrink-0 rounded-full border-[5px] border-primary bg-card transition-shadow select-none after:absolute after:-inset-2 hover:shadow-[0_0_0_4px_rgba(18,153,88,0.16)] focus-visible:shadow-[0_0_0_4px_rgba(18,153,88,0.24)] focus-visible:outline-hidden active:shadow-[0_0_0_4px_rgba(18,153,88,0.24)] disabled:pointer-events-none"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
