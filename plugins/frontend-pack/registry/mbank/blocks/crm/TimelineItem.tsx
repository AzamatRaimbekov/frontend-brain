import { StatusDot, type StatusDotTone } from "./StatusDot"

type TimelineItemProps = {
  title: string
  /** "12.10.2026, 10:02 · Система". */
  meta?: string
  tone?: StatusDotTone
  /** Machine-readable time for <time dateTime>. */
  dateTime?: string
}

/**
 * Figma `CRM / Timeline item` (contract crm-timeline-item): row gap 12; marker pt 4 with a 12px dot
 * (border/accent/* colour); content gap 4: title body/s medium, meta caption muted.
 */
export function TimelineItem({ title, meta, tone = "neutral", dateTime }: TimelineItemProps) {
  return (
    <li data-slot="timeline-item" className="flex gap-3">
      <span data-slot="timeline-item-marker" className="flex shrink-0 flex-col pt-1">
        <StatusDot data-slot="timeline-item-dot" tone={tone} />
      </span>
      <div data-slot="timeline-item-content" className="flex min-w-0 flex-col gap-1">
        <span data-slot="timeline-item-title" className="text-sm font-medium text-foreground">
          {title}
        </span>
        {meta &&
          (dateTime ? (
            <time data-slot="timeline-item-meta" dateTime={dateTime} className="text-caption text-muted-foreground">
              {meta}
            </time>
          ) : (
            <span data-slot="timeline-item-meta" className="text-caption text-muted-foreground">
              {meta}
            </span>
          ))}
      </div>
    </li>
  )
}
