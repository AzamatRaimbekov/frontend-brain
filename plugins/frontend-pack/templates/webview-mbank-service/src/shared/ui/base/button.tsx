import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cn } from '@shared/libs/cn'
import { type VariantProps, cva } from 'class-variance-authority'

const buttonVariants = cva(
  'group/button inline-flex active:opacity-90 shrink-0 items-center justify-center gap-2 rounded-[20px] border border-transparent bg-clip-padding px-5 text-center text-[17px] leading-[22px] font-bold whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:bg-input disabled:text-primary-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-5',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-primary',
        white: 'bg-card text-primary',
        text: 'bg-transparent px-0 text-primary',
        danger:
          'bg-destructive text-primary-foreground focus-visible:ring-destructive/30',
      },
      size: {
        default: 'h-14 min-w-14',
        md: 'h-12 min-w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

type ButtonProps = Omit<ButtonPrimitive.Props, 'className'> &
  VariantProps<typeof buttonVariants> & {
    className?: string
  }

function Button({
  className,
  variant = 'primary',
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
