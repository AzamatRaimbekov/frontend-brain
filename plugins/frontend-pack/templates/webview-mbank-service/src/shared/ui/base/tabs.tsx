import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cn } from '@shared/libs/cn'
import { type VariantProps, cva } from 'class-variance-authority'

type TabsProps = Omit<TabsPrimitive.Root.Props, 'className'> & {
  className?: string
}

type TabsListProps = Omit<TabsPrimitive.List.Props, 'className'> &
  VariantProps<typeof tabsListVariants> & {
    className?: string
  }

type TabsTriggerProps = Omit<TabsPrimitive.Tab.Props, 'className'> & {
  className?: string
}

type TabsContentProps = Omit<TabsPrimitive.Panel.Props, 'className'> & {
  className?: string
}

function Tabs({ className, orientation = 'horizontal', ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex data-horizontal:flex-col', className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center rounded-[9px] bg-muted p-0.5 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col',
  {
    variants: {
      size: {
        sm: 'h-9',
        md: 'h-12',
        lg: 'h-14',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

function TabsList({ className, size = 'md', ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-size={size}
      className={cn(tabsListVariants({ size }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        'relative inline-flex h-full flex-1 items-center justify-center rounded-[8px] border border-transparent px-3 text-center text-base leading-5 font-medium whitespace-nowrap text-foreground transition-colors group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:bg-card',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
