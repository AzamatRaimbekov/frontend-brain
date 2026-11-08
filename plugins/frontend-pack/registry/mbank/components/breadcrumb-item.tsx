import type * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/*
 * Breadcrumb item (Figma `Breadcrumb`). Generated from the contract
 * registry/mbank/contracts/breadcrumb-item.json by contract-to-code --new (template badge-like).
 * Change the look in the contract and run contract-to-code --write; the block between the markers is generated.
 * Accessibility: see the component comment below.
 */
// @contract breadcrumb-item start
const breadcrumbItemVariants = cva(
  "items-center gap-2 text-sm text-muted-foreground inline-flex min-w-0 whitespace-nowrap",
  {
    variants: {
      current: {
        false: "",
        true: "text-foreground font-medium",
      },
    },
    defaultVariants: { current: "false" },
  },
)
// @contract breadcrumb-item end

type BreadcrumbItemProps = Omit<React.ComponentProps<"li">, "children"> & {
  label: React.ReactNode
  /** Link of a parent item; the current page has none. */
  href?: string
  /** The current page: aria-current="page", no separator after it. */
  current?: boolean
}

/** One item of a breadcrumb trail: put them in <nav aria-label><ol>. */
function BreadcrumbItem({ className, label, href, current = false, ...props }: BreadcrumbItemProps) {
  return (
    <li data-slot="breadcrumb-item" className={cn(breadcrumbItemVariants({ current }), className)} {...props}>
      {current || !href ? (
        <span data-slot="breadcrumb-item-label" aria-current={current ? "page" : undefined} className="truncate">
          {label}
        </span>
      ) : (
        <a
          data-slot="breadcrumb-item-label"
          href={href}
          className="truncate rounded-xs outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30"
        >
          {label}
        </a>
      )}
      {!current && (
        <span data-slot="breadcrumb-item-separator" aria-hidden="true">
          /
        </span>
      )}
    </li>
  )
}

export { BreadcrumbItem, breadcrumbItemVariants }
