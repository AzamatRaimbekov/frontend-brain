import type * as React from "react"

import { cn } from "@/shared/lib/utils"

type CrmLayoutProps = {
  /** <SideMenu />; shown from 1024px, below that put <SideMenuSheet> in the header. */
  sideMenu: React.ReactNode
  /** <TopHeader />, sticky. */
  header: React.ReactNode
  /** Banner above everything, e.g. <OfflineBanner />. */
  banner?: React.ReactNode
  /** Icon-only rail (72px) instead of 280px. */
  collapsed?: boolean
  children: React.ReactNode
  className?: string
}

/** Figma CRM frame 1440: sideMenu 280 + content (topHeader 68, Body on background/onsurface/1). */
export function CrmLayout({ sideMenu, header, banner, collapsed = false, children, className }: CrmLayoutProps) {
  return (
    <div
      data-slot="crm-layout"
      className={cn(
        "min-h-dvh bg-surface-1 text-foreground lg:grid",
        collapsed ? "lg:grid-cols-[72px_minmax(0,1fr)]" : "lg:grid-cols-[280px_minmax(0,1fr)]",
        className,
      )}
    >
      <aside className="sticky top-0 hidden h-dvh lg:block">{sideMenu}</aside>
      <div className="flex min-w-0 flex-col">
        {banner}
        {header}
        <main id="main" className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
