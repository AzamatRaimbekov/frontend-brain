import { useId } from "react"
import type * as React from "react"

import { cn } from "@/shared/lib/utils"

/**
 * Mbank logo mark (Figma `logoCont` / `Logo`, 36px): green → teal tile, yellow left stroke, white "1".
 * Colours are the fixed product tokens (logos only). TODO: replace the paths with the SVG exported
 * from the brand library when it is available; the shape is traced from the CRM frame at 1440.
 */
export function MbankLogo({ className, ...props }: React.ComponentProps<"svg">) {
  const gradient = useId()
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" className={cn("size-9 shrink-0", className)} {...props}>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--brand-bank)" }} />
          <stop offset="1" style={{ stopColor: "var(--supportive-10)" }} />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="7" fill={`url(#${gradient})`} />
      <path
        d="M11.5 25.5V11.5l5 5"
        fill="none"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: "var(--primary-hover)" }}
      />
      <path
        d="M18 15.5l4.5-4v14"
        fill="none"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: "var(--static-light)" }}
      />
    </svg>
  )
}

type SideMenuBrandProps = {
  /** Product name, one line: "MBANK CRM". */
  name: string
  /** Logo instead of the Mbank mark (another product). */
  logo?: React.ReactNode
  className?: string
}

/** Figma `logoCont` of `sideMenu`: logo 36 + product name 20/28 bold, one line, truncated. */
export function SideMenuBrand({ name, logo, className }: SideMenuBrandProps) {
  return (
    <span data-slot="side-menu-brand" className={cn("flex min-w-0 items-center gap-3", className)}>
      {logo ?? <MbankLogo />}
      <span className="truncate text-xl font-bold whitespace-nowrap text-soft-foreground">{name}</span>
    </span>
  )
}
