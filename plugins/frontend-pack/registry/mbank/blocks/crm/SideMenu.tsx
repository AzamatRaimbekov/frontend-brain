import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { ChevronsLeftIcon } from "./crm-icons"
import { SideMenuSection } from "./SideMenuSection"
import type { RenderSideMenuLink, SideMenuSectionData } from "./side-menu-types"

type SideMenuProps = {
  /** Logo + product name (Figma `logoCont`, 76px). */
  brand: React.ReactNode
  sections: SideMenuSectionData[]
  /** Sections pinned to the bottom (Помощь: Настройки, База знаний, ...). */
  footerSections?: SideMenuSectionData[]
  /** Usually <SideMenuUser />. */
  user?: React.ReactNode
  activeId?: string
  renderLink?: RenderSideMenuLink
  collapsed?: boolean
  /** Shows the "<<" button in the logo row. */
  onToggleCollapsed?: () => void
  label?: string
  className?: string
}

/** Figma `sideMenu` (280px, background/onsurface/1): logo, menu groups, help group, user. */
export function SideMenu({
  brand,
  sections,
  footerSections = [],
  user,
  activeId,
  renderLink,
  collapsed = false,
  onToggleCollapsed,
  label = "Главное меню",
  className,
}: SideMenuProps) {
  const sectionProps = { activeId, collapsed, renderLink }
  return (
    <nav
      aria-label={label}
      data-slot="side-menu"
      data-collapsed={collapsed || undefined}
      className={cn("flex h-full min-h-0 flex-col bg-surface-1 text-foreground", className)}
    >
      <div className={cn("flex h-19 shrink-0 items-center justify-between gap-2 px-5", collapsed && "justify-center px-2")}>
        {!collapsed && brand}
        {onToggleCollapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
            aria-pressed={collapsed}
            onClick={onToggleCollapsed}
            className="text-muted-foreground"
          >
            <ChevronsLeftIcon className={cn(collapsed && "rotate-180")} />
          </Button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {sections.map((section) => (
          <SideMenuSection key={section.id} section={section} {...sectionProps} />
        ))}
      </div>
      {(footerSections.length > 0 || user) && (
        <div className="shrink-0">
          <div className="mx-3 border-t border-border" />
          <div>
            {footerSections.map((section) => (
              <SideMenuSection key={section.id} section={section} {...sectionProps} />
            ))}
          </div>
          {user && <div className="px-3 pb-4">{user}</div>}
        </div>
      )}
    </nav>
  )
}
