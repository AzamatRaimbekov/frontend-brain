import { cn } from '@shared/libs/cn'
import { Separator } from '@shared/ui/base/separator'

import { Fragment, ReactNode } from 'react'

export interface ListDescriptionItem {
  key?: string | number
  title: ReactNode
  description: ReactNode
  disabled?: boolean
  icon?: ReactNode
  onClick?: () => void
}

export interface ListDescriptionProps {
  list: ListDescriptionItem[]
  className?: string
  itemClassName?: string
  rightIcon?: ReactNode
}

const ListDescription = ({
  list,
  className,
  itemClassName,
  rightIcon,
}: ListDescriptionProps) => {
  return (
    <div className={cn('flex w-full flex-col', className)}>
      {list.map((item, index) => {
        const icon = item.icon ?? rightIcon
        const isClickable = Boolean(item.onClick)
        const itemKey = item.key ?? index
        const content = (
          <>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="font-[family-name:Nunito,sans-serif] text-xs font-normal text-muted-foreground">
                {item.title}
              </div>
              <div
                className="font-[family-name:Nunito,sans-serif] text-[17px] leading-[22px] font-normal tracking-[-0.2px] text-foreground"
                style={{
                  fontFeatureSettings: "'liga' off, 'clig' off",
                  fontVariantNumeric: 'lining-nums tabular-nums',
                }}
              >
                {item.description}
              </div>
            </div>
            {icon && (
              <div className="flex shrink-0 items-center justify-center text-muted-foreground">
                {icon}
              </div>
            )}
          </>
        )

        if (isClickable) {
          return (
            <Fragment key={itemKey}>
              <button
                type="button"
                disabled={item.disabled}
                onClick={item.onClick}
                className={cn(
                  'flex w-full items-center gap-3 py-3 text-left transition-colors enabled:hover:bg-secondary disabled:opacity-50',
                  itemClassName,
                )}
              >
                {content}
              </button>
              {index < list.length - 1 && <Separator />}
            </Fragment>
          )
        }

        return (
          <Fragment key={itemKey}>
            <div
              className={cn(
                'flex w-full items-center gap-3 py-3',
                itemClassName,
              )}
            >
              {content}
            </div>
            {index < list.length - 1 && <Separator />}
          </Fragment>
        )
      })}
    </div>
  )
}

export default ListDescription
