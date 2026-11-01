import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"

type BadgeTone = React.ComponentProps<typeof Badge>["tone"]

type CardLinkProps = { href: string; className: string; children: React.ReactNode; "data-slot": string }

type ApplicationCardProps = {
  /** "CL-240131". */
  id: string
  /** Already formatted: "10:41". */
  time: string
  /** Borrower name. */
  title: string
  /** Already formatted: "120 000 KGS". */
  amount: string
  /** "Потребительский · 12 мес". */
  meta?: string
  /** SLA or status badge: { label: "SLA 12 мин", tone: "info" }. */
  status?: { label: string; tone: BadgeTone }
  href: string
  /** Router link (default: <a href>). Spread the props: data-slot is part of the contract. */
  renderLink?: (props: CardLinkProps) => React.ReactNode
  className?: string
}

const anchor = ({ href, ...props }: CardLinkProps) => <a href={href} {...props} />

/**
 * Figma `CRM / Application card` (contract crm-application-card): p 12, gap 4, radius-md, card surface;
 * id + time caption, name body/s medium, amount body/l bold, meta caption, footer pt 4 with Badge-status S rounded.
 */
export function ApplicationCard({
  id,
  time,
  title,
  amount,
  meta,
  status,
  href,
  renderLink = anchor,
  className,
}: ApplicationCardProps) {
  return renderLink({
    href,
    "data-slot": "application-card",
    className: cn(
      "flex flex-col gap-1 rounded-md bg-card p-3 text-card-foreground transition-shadow outline-none",
      "hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/30",
      className,
    ),
    children: (
      <>
        <span data-slot="application-card-top" className="flex items-center justify-between gap-2 text-caption text-muted-foreground">
          <span data-slot="application-card-id">{id}</span>
          <span data-slot="application-card-time">{time}</span>
        </span>
        <span data-slot="application-card-name" className="truncate text-sm font-medium text-foreground">
          {title}
        </span>
        <span data-slot="application-card-amount" className="text-base font-bold text-foreground">
          {amount}
        </span>
        {meta && (
          <span data-slot="application-card-meta" className="truncate text-caption text-muted-foreground">
            {meta}
          </span>
        )}
        {status && (
          <span data-slot="application-card-footer" className="flex pt-1">
            <Badge data-slot="application-card-badge" size="sm" tone={status.tone}>
              {status.label}
            </Badge>
          </span>
        )}
      </>
    ),
  })
}
