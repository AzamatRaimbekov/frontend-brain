import { Icon } from '@shared/iconpack'
import { cn } from '@shared/libs/cn'

import {
  HorizontalStepperItem,
  HorizontalStepperProps,
  HorizontalStepperStatus,
} from '../model'

const markerToneClassNames: Record<HorizontalStepperStatus, string> = {
  finish: 'bg-primary text-primary-foreground',
  process: 'bg-primary text-primary-foreground',
  wait: 'bg-card text-border',
}

const labelToneClassNames: Record<HorizontalStepperStatus, string> = {
  finish: 'text-foreground',
  process: 'text-foreground',
  wait: 'text-input',
}

function getItemStatus(
  item: HorizontalStepperItem,
  index: number,
  current: number,
) {
  if (item.status) return item.status
  if (index < current) return 'finish'
  if (index === current) return 'process'

  return 'wait'
}

export function HorizontalStepper({
  className,
  current = 0,
  itemClassName,
  items,
  labelClassName,
  lineClassName,
  markerClassName,
  markerSize = 28,
}: HorizontalStepperProps) {
  if (!items.length) return null

  const gridTemplateColumns = items
    .flatMap((_, index) =>
      index < items.length - 1
        ? [`${markerSize}px`, 'minmax(0, 1fr)']
        : [`${markerSize}px`],
    )
    .join(' ')

  return (
    <ol
      className={cn('grid w-full items-start gap-y-2', className)}
      style={{ gridTemplateColumns }}
    >
      {items.map((item, index) => {
        const status = getItemStatus(item, index, current)
        const rightLineStatus = index < current ? 'finish' : 'wait'
        const markerColumn = index * 2 + 1
        const lineColumn = markerColumn + 1

        return (
          <li
            className={cn('contents', itemClassName)}
            key={item.id}
          >
            <span
              className={cn(
                'relative z-10 flex shrink-0 items-center justify-center rounded-full text-[15px] leading-none font-extrabold',
                markerToneClassNames[status],
                markerClassName,
                item.markerClassName,
              )}
              style={{
                gridColumn: markerColumn,
                gridRow: 1,
                height: markerSize,
                width: markerSize,
              }}
            >
              {status === 'finish' ? (
                <Icon
                  name="completed"
                  size={20}
                  color="white"
                />
              ) : (
                index + 1
              )}
            </span>
            {index < items.length - 1 && (
              <span
                className={cn(
                  'mx-2 h-1 self-center rounded-full',
                  rightLineStatus === 'finish' ? 'bg-primary' : 'bg-muted',
                  lineClassName,
                  item.lineClassName,
                )}
                style={{
                  gridColumn: lineColumn,
                  gridRow: 1,
                }}
              />
            )}
            <span
              className={cn(
                'min-w-0 truncate text-left text-[13px]/[16px] font-medium',
                labelToneClassNames[status],
                labelClassName,
                item.labelClassName,
              )}
              style={{
                gridColumn:
                  index < items.length - 1
                    ? `${markerColumn} / span 2`
                    : markerColumn,
                gridRow: 2,
              }}
            >
              {item.title}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
