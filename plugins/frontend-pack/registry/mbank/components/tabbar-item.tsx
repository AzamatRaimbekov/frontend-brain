import type * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/*
 * Tabbar item (Figma `Tabbar item`). Generated from the contract
 * registry/mbank/contracts/tabbar-item.json by contract-to-code --new (template button-like).
 * Change the look in the contract and run contract-to-code --write; the block between the markers is generated.
 * Accessibility: see the component comment below.
 */
// @contract tabbar-item start
const tabbarItemVariants = cva(
  "flex flex-col items-center gap-1 px-2 py-2 text-2xs font-medium text-muted-foreground aria-[current=page]:text-brand-text focus-visible:ring-[3px] focus-visible:ring-ring/30 [&_svg]:size-6 min-w-0 flex-1 justify-center transition-colors outline-none [&_svg]:shrink-0",
)
// @contract tabbar-item end

type TabbarItemProps = React.ComponentProps<"a"> & {
  active?: boolean
  icon?: React.ReactNode
}

/** Mobile bottom bar item: icon over a short label; the selected look follows aria-current="page". */
function TabbarItem({ className, active = false, icon, children, ...props }: TabbarItemProps) {
  return (
    <a
      data-slot="tabbar-item"
      aria-current={active ? "page" : undefined}
      className={cn(tabbarItemVariants(), className)}
      {...props}
    >
      {icon}
      <span data-slot="tabbar-item-label" className="max-w-full truncate">
        {children}
      </span>
    </a>
  )
}

export { TabbarItem, tabbarItemVariants }
