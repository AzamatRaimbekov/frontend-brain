import { cn } from '@shared/libs/cn'
import { Spinner } from '@shared/ui/base/spinner'

interface PreloaderProps {
  className?: string
  spinnerClassName?: string
}

export function Preloader({ className, spinnerClassName }: PreloaderProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-1 items-center justify-center',
        className,
      )}
    >
      <Spinner className={cn('size-8 text-primary', spinnerClassName)} />
    </div>
  )
}
