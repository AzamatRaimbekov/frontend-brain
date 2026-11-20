import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'
import { cn } from '@shared/libs/cn'

type SeparatorProps = Omit<SeparatorPrimitive.Props, 'className'> & {
  className?: string
}

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch',
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
