import type * as React from "react"

import { cn } from "@/shared/lib/utils"

export type BreadcrumbItem = { id: string; label: string; href?: string }

type BreadcrumbLinkProps = { item: BreadcrumbItem; className: string; children: React.ReactNode }

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  /** Router link for items with href (default: <a href>). The last item is the current page. */
  renderLink?: (props: BreadcrumbLinkProps) => React.ReactNode
  className?: string
}

const anchor = ({ item, ...props }: BreadcrumbLinkProps) => <a href={item.href} {...props} />

/**
 * Figma `topHeader subheader`: Кредиты / На андеррайтинге / CL-240118 (18/26, muted parents).
 * The current item never truncates; parents truncate first and hide below 768px.
 */
export function Breadcrumbs({ items, renderLink = anchor, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Хлебные крошки" data-slot="breadcrumbs" className={cn("min-w-0", className)}>
      <ol className="flex min-w-0 items-center text-lg">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <li key={item.id} className={cn("flex items-center whitespace-nowrap", last ? "shrink-0" : "min-w-0 max-md:hidden")}>
              {last ? (
                <span aria-current="page" className="truncate font-medium text-foreground">
                  {item.label}
                </span>
              ) : item.href ? (
                renderLink({
                  item,
                  className: "truncate text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30 rounded-xs",
                  children: item.label,
                })
              ) : (
                <span className="truncate text-muted-foreground">{item.label}</span>
              )}
              {!last && (
                <span aria-hidden="true" className="px-2 text-muted-foreground">
                  /
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
