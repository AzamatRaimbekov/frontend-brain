import { useId, useState } from "react"

import { cn } from "@/shared/lib/utils"
import { ChevronDownIcon } from "@/shared/ui/icons"
import { SideMenuItem } from "./SideMenuItem"
import type { RenderSideMenuLink, SideMenuSectionData } from "./side-menu-types"

type SideMenuSectionProps = {
  section: SideMenuSectionData
  activeId?: string
  collapsed?: boolean
  renderLink?: RenderSideMenuLink
}

/** Figma `listMenu`: uppercase 36px header (chevron + title + action) and 44px items. */
export function SideMenuSection({ section, activeId, collapsed = false, renderLink }: SideMenuSectionProps) {
  const [open, setOpen] = useState(true)
  const listId = useId()
  const showHeader = Boolean(section.title) && !collapsed
  const headerText = "text-caption font-medium uppercase text-muted-foreground"

  return (
    <div data-slot="side-menu-section" className="group/section px-3">
      <div className="border-b border-border py-2 group-last/section:border-b-0">
        {showHeader && (
          <div className="flex h-9 items-center justify-between gap-2 pr-1">
            {section.collapsible ? (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => setOpen((value) => !value)}
                className={cn(
                  headerText,
                  "flex h-9 items-center gap-3 rounded-sm px-3 outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30",
                )}
              >
                <ChevronDownIcon className={cn("size-5 transition-transform", !open && "-rotate-90")} />
                {section.title}
              </button>
            ) : (
              <span className={cn(headerText, "px-3")}>{section.title}</span>
            )}
            {section.action}
          </div>
        )}
        <ul
          id={listId}
          aria-label={section.title}
          hidden={!open && !collapsed}
          className="flex flex-col"
        >
          {section.items.map((item) => (
            <SideMenuItem
              key={item.id}
              item={item}
              active={item.id === activeId}
              collapsed={collapsed}
              renderLink={renderLink}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
