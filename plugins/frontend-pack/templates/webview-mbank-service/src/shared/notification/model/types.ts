import { ExternalToast } from 'sonner'

import { ReactNode } from 'react'

export type NotificationType =
  | 'default'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'loading'

export type NotificationProps = Omit<ExternalToast, 'description' | 'icon'> & {
  type?: NotificationType
  title?: ReactNode
  subtitle?: ReactNode
  message?: ReactNode
  description?: ReactNode
}

export interface GlobalNotificationEvent {
  id: number
  props: NotificationProps
}

export interface GlobalNotificationState {
  events: GlobalNotificationEvent[]
  nextEventId: number
}
