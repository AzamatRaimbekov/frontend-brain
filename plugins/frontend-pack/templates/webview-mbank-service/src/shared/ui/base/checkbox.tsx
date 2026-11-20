import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { cn } from '@shared/libs/cn'
import { Check } from 'lucide-react'

export type CheckboxSize = 'sm' | 'md' | 'lg'

export type CheckboxProps = Omit<
  CheckboxPrimitive.Root.Props,
  'className' | 'onCheckedChange'
> & {
  className?: string
  size?: CheckboxSize
  onChange?: (checked: boolean) => void
  onCheckedChange?: CheckboxPrimitive.Root.Props['onCheckedChange']
}

function Checkbox({
  className,
  onChange,
  onCheckedChange,
  size = 'md',
  ...props
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-size={size}
      className={cn(
        'group/checkbox inline-flex shrink-0 cursor-pointer items-center justify-center border border-input bg-transparent text-primary-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-checked:border-primary data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[size=lg]:size-8 data-[size=lg]:rounded-[8px] data-[size=md]:size-6 data-[size=md]:rounded-[8px] data-[size=sm]:size-4 data-[size=sm]:rounded-[6px]',
        className,
      )}
      onCheckedChange={(checked, eventDetails) => {
        onCheckedChange?.(checked, eventDetails)
        onChange?.(checked)
      }}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        <Check
          aria-hidden="true"
          className="size-4 stroke-[3] group-data-[size=sm]/checkbox:size-3"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
