import { StatusDot, type StatusDotTone } from "./StatusDot"

type TimelineItemProps = {
  title: string
  /** "12.10.2026, 10:02 · Система". */
  meta?: string
  tone?: StatusDotTone
  /** Machine-readable time for <time dateTime>. */
  dateTime?: string
}

/** Figma `CRM / Timeline item` (40px): 12px dot, title 14 medium, meta caption muted. */
export function TimelineItem({ title, meta, tone = "neutral", dateTime }: TimelineItemProps) {
  return (
    <li data-slot="timeline-item" className="flex gap-3">
      <StatusDot tone={tone} className="mt-1" />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-medium text-foreground">{title}</span>
        {meta &&
          (dateTime ? (
            <time dateTime={dateTime} className="text-caption text-muted-foreground">
              {meta}
            </time>
          ) : (
            <span className="text-caption text-muted-foreground">{meta}</span>
          ))}
      </div>
    </li>
  )
}
