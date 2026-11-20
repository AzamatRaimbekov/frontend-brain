import { useTheme } from '@shared/theme'
import {
  CheckCircle2Icon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
  XCircleIcon,
} from 'lucide-react'
import { Toaster as SonnerToaster } from 'sonner'
import type { ToasterProps } from 'sonner'

function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      closeButton
      swipeDirections={['right']}
      toastOptions={{
        classNames: {
          toast:
            'rounded-[20px] border-border bg-card text-foreground shadow-lg font-[family-name:Nunito,sans-serif]',
          title: 'text-[17px] font-semibold leading-[1.42857] text-foreground',
          description: 'text-[13px] leading-[1.42857] text-muted-foreground',
          content: 'flex flex-col gap-1',
          icon: 'text-primary',
          success: 'text-primary',
          info: 'text-info',
          warning: 'text-warning',
          error: 'text-destructive',
          loading: 'text-muted-foreground',
          closeButton:
            'border-border bg-card text-foreground hover:bg-secondary',
        },
      }}
      icons={{
        success: <CheckCircle2Icon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <XCircleIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
