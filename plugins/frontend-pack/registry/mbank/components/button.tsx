import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/shared/lib/utils"
import { Spinner } from "./spinner"

/*
 * Figma `button/default` (Web components). variant -> Figma variant:
 * primary (accent/primary, yellow), brand (1.brand), secondary (neutral/primary, near-black),
 * destructive (negative), success (positive), soft (flat filled), ghost (flat), outline, static.
 * Heights follow the input scale (L 56 / M 44 / S 36 / 32); Figma has no focus state (G10),
 * so focus-visible uses the brand ring.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-[3px] aria-invalid:ring-border-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        brand: "bg-brand text-brand-foreground hover:bg-brand-hover active:bg-brand-active",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive-hover active:bg-destructive-active",
        success: "bg-success text-success-foreground hover:bg-success-hover active:bg-success-active",
        soft: "bg-soft text-soft-foreground-strong hover:bg-soft-hover",
        ghost: "bg-ghost text-ghost-foreground hover:bg-ghost-hover",
        outline:
          "border border-outline bg-background text-outline-foreground hover:border-outline-hover hover:bg-muted",
        static: "bg-static text-static-foreground hover:bg-static-hover active:bg-static-active",
        link: "h-auto px-0 text-link underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-8 px-3 text-xs [&_svg:not([class*='size-'])]:size-4",
        sm: "h-9 px-3 text-sm [&_svg:not([class*='size-'])]:size-4",
        md: "h-11 px-4 text-sm",
        lg: "h-14 px-6 text-base",
        "icon-sm": "size-9",
        icon: "size-11",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Shows a spinner, disables the button and sets aria-busy. Ignored with asChild. */
    loading?: boolean
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className)

  if (asChild) {
    return (
      <Slot.Root data-slot="button" className={classes} {...props}>
        {children}
      </Slot.Root>
    )
  }

  return (
    <button
      data-slot="button"
      data-loading={loading || undefined}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner aria-hidden="true" role="presentation" aria-label={undefined} />}
      {children}
    </button>
  )
}

export { Button, buttonVariants }
