import { cn } from '@shared/libs/cn'
import { Button } from '@shared/ui/Button'
import { BigChevronLeft } from 'md-glyphs'

import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useHeader } from '../hooks'

interface HeaderProps {
  children?: ReactNode
  className?: string
  rightAction?: ReactNode
  showBack?: boolean
  showTitle?: boolean
  wrapperClassName?: string
}

export function Header({
  className,
  rightAction,
  showBack = true,
  showTitle = true,
  wrapperClassName,
  children,
}: HeaderProps) {
  const {
    title,
    handleBack,
    isSubtitle,
    subtitle,
    dynamicTitle,
    dynamicTitleState,
  } = useHeader()
  const { t } = useTranslation()
  const onHandleClick = () => {
    handleBack()
  }
  return (
    <header
      className={cn('sticky top-0 z-50 h-14 w-full bg-card', wrapperClassName)}
    >
      <div
        className={cn(
          'relative mx-auto h-full w-full max-w-3xl items-center justify-center px-1',
          'flex',
          className,
        )}
      >
        {showBack && (
          <Button
            variant="text"
            className="absolute left-3 flex h-[44px] w-[44px] min-w-[44px] items-center justify-center text-muted-foreground"
            onClick={onHandleClick}
          >
            <div className="flex items-center justify-center rounded-full p-2">
              <BigChevronLeft
                size={24}
                className="mr-0.5"
                color="var(--color-primary)"
              />
            </div>
          </Button>
        )}
        {showTitle && (
          <div className="flex w-full flex-col items-center justify-center pr-[52px] pl-[52px]">
            <div className="line-clamp-2 flex-1 overflow-hidden text-center text-base/[1.42857] font-bold text-foreground">
              {dynamicTitle ? dynamicTitleState : t(title as string)}
            </div>
            {isSubtitle && (
              <div className="line-clamp-2 max-w-[200px] flex-1 overflow-hidden text-center text-xs font-medium text-muted-foreground">
                {subtitle}
              </div>
            )}
          </div>
        )}
        {rightAction && (
          <div className="absolute right-3 flex h-[44px] w-[44px] min-w-[44px] items-center justify-center">
            {rightAction}
          </div>
        )}
      </div>
      {children}
    </header>
  )
}
