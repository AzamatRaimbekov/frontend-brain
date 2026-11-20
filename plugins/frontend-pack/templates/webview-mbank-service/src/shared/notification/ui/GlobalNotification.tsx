import { useAppDispatch, useAppSelector } from '@shared/hooks/useRedux'
import { Toaster } from '@shared/ui/base/sonner'
import { toast } from 'sonner'

import { useEffect, useRef } from 'react'

import {
  GlobalNotificationSliceActions,
  notificationEventSelector,
} from '../model'
import { type NotificationProps } from '../model/types'

const showNotification = (props: NotificationProps) => {
  const {
    type = 'default',
    title,
    subtitle,
    message,
    description,
    ...toastProps
  } = props

  const toastTitle = title ?? message ?? subtitle ?? description ?? ''
  const toastDescription =
    title || message ? (subtitle ?? description) : undefined
  const options = {
    ...toastProps,
    description: toastDescription,
  }

  switch (type) {
    case 'success':
      toast.success(toastTitle, options)
      return
    case 'info':
      toast.info(toastTitle, options)
      return
    case 'warning':
      toast.warning(toastTitle, options)
      return
    case 'error':
      toast.error(toastTitle, options)
      return
    case 'loading':
      toast.loading(toastTitle, options)
      return
    default:
      toast(toastTitle, options)
  }
}

export default function GlobalNotification() {
  const dispatch = useAppDispatch()
  const event = useAppSelector(notificationEventSelector)
  const shownEventId = useRef<number | null>(null)

  useEffect(() => {
    if (!event || shownEventId.current === event.id) {
      return
    }

    shownEventId.current = event.id
    showNotification(event.props)
    dispatch(GlobalNotificationSliceActions.consumeNotification(event.id))
  }, [dispatch, event])

  return <Toaster />
}
