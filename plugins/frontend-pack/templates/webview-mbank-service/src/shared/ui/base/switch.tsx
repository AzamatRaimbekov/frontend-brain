import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cn } from '@shared/libs/cn'

export type SwitchSize = 'sm' | 'md' | 'lg'

export type SwitchProps = Omit<SwitchPrimitive.Root.Props, 'className'> & {
  className?: string
  size?: SwitchSize
}

function Switch({ className, size = 'md', ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent p-0.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 data-unchecked:bg-muted data-[size=lg]:h-8 data-[size=lg]:w-[52px] data-[size=md]:h-6 data-[size=md]:w-11 data-[size=sm]:h-5 data-[size=sm]:w-9',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-card shadow-sm ring-0 transition-transform group-data-[size=lg]/switch:size-7 group-data-[size=md]/switch:size-5 group-data-[size=sm]/switch:size-4 group-data-[size=lg]/switch:data-checked:translate-x-5 group-data-[size=md]/switch:data-checked:translate-x-5 group-data-[size=sm]/switch:data-checked:translate-x-4"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
