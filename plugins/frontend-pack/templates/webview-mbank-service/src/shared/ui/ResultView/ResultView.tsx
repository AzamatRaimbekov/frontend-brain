import { Header } from '@modules/Common'
import { useAppNavigate } from '@shared/hooks/useAppNavigate'
import { cn } from '@shared/libs/cn'
import { Cross } from 'md-glyphs'

import { ReactNode } from 'react'

import { Button } from '../Button'

export interface ResultViewProps {
  title: string
  subtitle: ReactNode
  button?: ReactNode
  buttonClassName?: string
  className?: string
  contentClassName?: string
  icon: ReactNode
  onCloseClick?: () => void
  showClose?: boolean
}

const ResultView = ({
  icon,
  subtitle,
  title,
  button,
  buttonClassName,
  className,
  contentClassName,
  onCloseClick,
  showClose = true,
}: ResultViewProps) => {
  const navigate = useAppNavigate()

  const handleClose = () => {
    if (onCloseClick) {
      onCloseClick()
      return
    }

    navigate('/')
  }

  return (
    <div
      className={cn(
        'flex min-h-dvh w-full flex-col bg-card text-center',
        className,
      )}
    >
      {showClose && (
        <Header
          showBack={false}
          showTitle={false}
          wrapperClassName="bg-card"
          rightAction={
            <Button
              variant="text"
              className="flex h-11 w-11 min-w-11 items-center justify-center"
              onClick={handleClose}
            >
              <Cross
                aria-hidden
                size={24}
                color="var(--color-primary)"
              />
            </Button>
          }
        />
      )}
      <div
        className={cn(
          'flex flex-1 flex-col items-center justify-center px-4',
          contentClassName,
        )}
      >
        <div className="mb-4">{icon}</div>
        <div className="mb-2 text-[22px] leading-7 font-bold text-foreground">
          {title}
        </div>
        <div className="text-base text-input">{subtitle}</div>
      </div>
      {button && (
        <div
          className={cn(
            'w-full px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]',
            buttonClassName,
          )}
        >
          {button}
        </div>
      )}
    </div>
  )
}

export default ResultView
