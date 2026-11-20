import { Icon } from '@shared/iconpack'
import { cn } from '@shared/libs/cn'
import { Alert, AlertDescription, AlertTitle } from '@shared/ui/base/alert'

import { ReactNode } from 'react'

export interface WarningInfoProps {
  title?: ReactNode
  className?: string
  description?: ReactNode
  iconColor?: string
  descriptionCls?: string
}

export function WarningInfo({
  title,
  className,
  description,
  descriptionCls,
  iconColor = 'var(--color-muted-foreground)',
}: WarningInfoProps) {
  return (
    <Alert className={className}>
      <Icon
        aria-hidden
        name="warning"
        size={24}
        color={iconColor}
      />
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && (
        <AlertDescription className={cn(title && 'mt-1', descriptionCls)}>
          {description}
        </AlertDescription>
      )}
    </Alert>
  )
}
