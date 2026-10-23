import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/shared/lib/utils"

/*
 * Figma `Avatars` (15 sizes, 24-96 px; Placeholder on/off). The common web sizes are exposed;
 * use className="size-24" etc. for the rest. Fallback = initials on background/onsurface/2.
 */
const avatarVariants = cva("relative flex shrink-0 overflow-hidden rounded-full", {
  variants: {
    size: {
      xs: "size-6 text-xs",
      sm: "size-8 text-xs",
      md: "size-10 text-sm",
      lg: "size-14 text-base",
      xl: "size-18 text-xl",
    },
  },
  defaultVariants: { size: "md" },
})

function Avatar({
  className,
  size,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-surface-2 font-medium text-soft-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants }
