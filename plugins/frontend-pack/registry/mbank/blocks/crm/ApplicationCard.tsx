import type * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"

type BadgeTone = React.ComponentProps<typeof Badge>["tone"]

type CardLinkProps = { href: string; className: string; children: React.ReactNode }

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
  /** Router link (default: <a href>). */
  renderLink?: (props: CardLinkProps) => React.ReactNode
  className?: string
}

const anchor = ({ href, ...props }: CardLinkProps) => <a href={href} {...props} />

/** Figma `CRM / Application card` (140px, p 12): id + time, name, amount, product · term, badge. */
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
    className: cn(
      "flex min-h-35 flex-col gap-1 rounded-md bg-card p-3 text-card-foreground transition-shadow outline-none",
      "hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/30",
      className,
    ),
    children: (
      <>
        <span className="flex items-center justify-between gap-2 text-caption text-muted-foreground">
          <span>{id}</span>
          <span>{time}</span>
        </span>
        <span className="truncate text-sm text-foreground">{title}</span>
        <span className="text-base font-bold text-foreground">{amount}</span>
        {meta && <span className="truncate text-caption text-muted-foreground">{meta}</span>}
        {status && (
          <span className="mt-auto flex pt-1">
            <Badge size="sm" tone={status.tone} shape="square" className="rounded-sm">
              {status.label}
            </Badge>
          </span>
        )}
      </>
    ),
  })
}
