import { useAppDispatch } from '@shared/hooks/useRedux'

import { useCallback } from 'react'

import { GlobalNotificationSliceActions } from '../model'
import { type NotificationProps } from '../model/types'

export const useGlobalNotification = () => {
  const dispatch = useAppDispatch()

  const openNotification = useCallback(
    (props: NotificationProps) => {
      dispatch(GlobalNotificationSliceActions.openNotification(props))
    },
    [dispatch],
  )

  return {
    openNotification,
  }
}
