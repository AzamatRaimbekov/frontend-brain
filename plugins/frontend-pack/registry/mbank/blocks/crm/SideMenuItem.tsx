import { cn } from "@/shared/lib/utils"
import type { RenderSideMenuLink, SideMenuItemData, SideMenuLinkProps } from "./side-menu-types"

const anchor: RenderSideMenuLink = ({ item, ...props }: SideMenuLinkProps) => (
  <a href={item.href} {...props} />
)

type SideMenuItemProps = {
  item: SideMenuItemData
  active?: boolean
  /** Icon-only rail: the label stays for screen readers. */
  collapsed?: boolean
  renderLink?: RenderSideMenuLink
}

/** Figma `item-sidemenu-menu-tree-states`: 44px, icon 20, active = sidebar-accent (upstream shadcn sidebar). */
export function SideMenuItem({ item, active = false, collapsed = false, renderLink = anchor }: SideMenuItemProps) {
  const Icon = item.icon
  const className = cn(
    "flex h-11 items-center gap-3 rounded-md px-3 text-sm text-sidebar-foreground transition-colors outline-none",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-[3px] focus-visible:ring-sidebar-ring aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground",
    collapsed && "justify-center px-0",
  )
  return (
    <li data-slot="side-menu-item">
      {renderLink({
        item,
        className,
        "aria-current": active ? "page" : undefined,
        children: (
          <>
            {Icon && <Icon className="size-5 shrink-0" />}
            <span className={cn("min-w-0 flex-1 truncate", collapsed && "sr-only")}>{item.label}</span>
            {!collapsed && item.badge}
          </>
        ),
      })}
    </li>
  )
}
