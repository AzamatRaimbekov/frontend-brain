import type * as React from "react"

import { cn } from "@/shared/lib/utils"

type TopHeaderProps = {
  /** Page title (h1). Leave empty when the page shows breadcrumbs and its own h1. */
  title?: React.ReactNode
  /** "p" when the title is the section/product name and the page h1 is in the body (Figma: "Кредитный конвейер" + "Конвейер на 12 октября"). */
  titleAs?: "h1" | "p"
  /** <Breadcrumbs /> instead of the title (Figma `topHeader subheader`). */
  breadcrumbs?: React.ReactNode
  /** Back link/button before the title, e.g. an icon Button with ChevronLeftIcon. */
  back?: React.ReactNode
  /** Mobile menu trigger: <SideMenuSheet>. */
  leading?: React.ReactNode
  /** <HeaderSearch />, hidden below 768px. */
  search?: React.ReactNode
  /** Buttons such as "Экспорт", <HeaderIconButton>s. */
  actions?: React.ReactNode
  /** <UserMenu />. */
  user?: React.ReactNode
  className?: string
}

/** Figma `topHeader` (68px, background/surface/light, bottom divider): title left, tools right. */
export function TopHeader({ title, titleAs: Title = "h1", breadcrumbs, back, leading, search, actions, user, className }: TopHeaderProps) {
  return (
    <header
      data-slot="top-header"
      className={cn(
        "sticky top-0 z-(--z-sticky) flex h-17 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6 lg:px-10",
        className,
      )}
    >
      {leading}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {back}
        {title && <Title className="truncate text-lg font-bold text-foreground">{title}</Title>}
        {breadcrumbs}
      </div>
      <div className="flex shrink-0 items-center gap-2 md:gap-4">
        {search && <div className="hidden md:block">{search}</div>}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
        {user}
      </div>
    </header>
  )
}
