import type { ReactNode } from "react"

import { cn } from "@/shared/lib/utils"

/*
 * Shared composite (react-ux: src/shared/components/EmptyState.tsx), same props as the react-ux
 * reference plus className. Mbank has no empty-state component in Web components yet (G12);
 * built from tokens only. Pass an Mbank icon via `icon`.
 */
type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        // @contract empty-state start
        "flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-secondary px-6 py-16 text-center",
        // @contract empty-state end
        className,
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-full bg-surface-1 text-muted-foreground [&_svg]:size-7"
        >
          {icon}
        </div>
      )}
      <p className="text-base font-bold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}
