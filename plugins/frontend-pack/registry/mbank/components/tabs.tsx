import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/shared/lib/utils"

/*
 * Figma `segment` / `tab-outline` / `Item / tabLine`. Set variant on TabsList; triggers read it
 * from the list's data-variant. Figma tabs have no focus or disabled state (G10); both are added.
 */
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

// @contract tabs-list start
const tabsListVariants = cva("group/tabs-list inline-flex w-fit items-center", {
  variants: {
    variant: {
      segment: "gap-1 rounded-md bg-muted p-1",
      outline: "gap-2",
      line: "gap-6 border-b border-border",
    },
  },
  defaultVariants: { variant: "segment" },
})
// @contract tabs-list end

function TabsList({
  className,
  variant = "segment",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // @contract tabs-trigger start
        "inline-flex h-9 items-center justify-center gap-2 px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:text-disabled-foreground [&_svg]:size-4 [&_svg]:shrink-0",
        "group-data-[variant=segment]/tabs-list:rounded-sm group-data-[variant=segment]/tabs-list:data-[state=active]:bg-background group-data-[variant=segment]/tabs-list:data-[state=active]:text-foreground group-data-[variant=segment]/tabs-list:data-[state=active]:shadow-xs",
        "group-data-[variant=outline]/tabs-list:rounded-md group-data-[variant=outline]/tabs-list:border group-data-[variant=outline]/tabs-list:border-border group-data-[variant=outline]/tabs-list:data-[state=active]:border-secondary group-data-[variant=outline]/tabs-list:data-[state=active]:bg-secondary group-data-[variant=outline]/tabs-list:data-[state=active]:text-secondary-foreground",
        "group-data-[variant=line]/tabs-list:-mb-px group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:px-0 group-data-[variant=line]/tabs-list:data-[state=active]:border-brand group-data-[variant=line]/tabs-list:data-[state=active]:text-foreground",
        // @contract tabs-trigger end
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
