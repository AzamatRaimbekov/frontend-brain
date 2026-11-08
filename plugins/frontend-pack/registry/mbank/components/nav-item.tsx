import type * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/*
 * Nav item (Figma `item-sidemenu-menu-tree-1`). Generated from the contract
 * registry/mbank/contracts/nav-item.json by contract-to-code --new (template button-like).
 * Change the look in the contract and run contract-to-code --write; the block between the markers is generated.
 * Accessibility: see the component comment below.
 */
// @contract nav-item start
const navItemVariants = cva(
  "gap-3 px-3 h-11 rounded-md text-sm font-medium text-soft-foreground items-center hover:bg-accent aria-[current=page]:bg-muted aria-[current=page]:text-foreground aria-disabled:text-disabled-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 [&_svg]:size-5 [&_svg]:text-muted-foreground [&_svg]:aria-[current=page]:text-foreground [&_svg]:aria-disabled:text-disabled-foreground flex w-full min-w-0 transition-colors outline-none aria-disabled:pointer-events-none [&_svg]:shrink-0",
)
// @contract nav-item end

type NavItemProps = React.ComponentProps<"a"> & {
  /** Current page: aria-current="page" (selected look). */
  active?: boolean
  /** Icon on the left (Mbank 20px glyph). */
  icon?: React.ReactNode
  /** Counter on the right (number of new items). */
  count?: React.ReactNode
}

/** Side menu item: a link; the selected look follows aria-current="page", disabled — aria-disabled. */
function NavItem({ className, active = false, icon, count, children, ...props }: NavItemProps) {
  return (
    <a
      data-slot="nav-item"
      aria-current={active ? "page" : undefined}
      className={cn(navItemVariants(), className)}
      {...props}
    >
      {icon}
      <span data-slot="nav-item-label" className="min-w-0 flex-1 truncate">
        {children}
      </span>
      {count !== undefined && (
        <span data-slot="nav-item-count" className="text-caption font-medium text-muted-foreground tabular-nums">
          {count}
        </span>
      )}
    </a>
  )
}

export { NavItem, navItemVariants }
