import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar"

type ListItemProps = Omit<React.ComponentProps<"li">, "title"> & {
  title: React.ReactNode
  subtitle?: React.ReactNode
  /** Right column: time, amount or a status badge. */
  meta?: React.ReactNode
  /** Initials for the avatar fallback ("АН"); with src the photo is shown. */
  initials?: string
  src?: string
}

/**
 * `CRM / List item` (contract crm-list-item): avatar 40, title body/s medium + subtitle label/m muted,
 * meta on the right, row gap 12, px 16 py 12, divider at the bottom. Put items in a <ul>; wrap the content
 * in a link or button yourself when the row opens a card.
 */
export function ListItem({ title, subtitle, meta, initials, src, className, ...props }: ListItemProps) {
  return (
    <li
      data-slot="crm-list-item"
      className={cn("flex items-center gap-3 border-b border-border bg-card px-4 py-3 last:border-b-0", className)}
      {...props}
    >
      <Avatar data-slot="crm-list-item-avatar" size="md">
        {src && <AvatarImage src={src} alt="" />}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div data-slot="crm-list-item-content" className="flex min-w-0 flex-1 flex-col gap-1">
        <span data-slot="crm-list-item-title" className="truncate text-sm font-medium text-foreground">
          {title}
        </span>
        {subtitle && (
          <span data-slot="crm-list-item-subtitle" className="truncate text-caption text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
      {meta && (
        <span data-slot="crm-list-item-meta" className="shrink-0 text-caption text-muted-foreground tabular-nums">
          {meta}
        </span>
      )}
    </li>
  )
}
