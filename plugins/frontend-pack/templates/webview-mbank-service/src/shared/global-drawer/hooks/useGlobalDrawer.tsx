import { useAppDispatch } from '@shared/hooks/useRedux'

import { useCallback } from 'react'

import { GlobalDrawerSliceActions } from '../model/global-drawer-slice'
import { type GlobalDrawerState } from '../model/types'

export const useGlobalDrawer = () => {
  const dispatch = useAppDispatch()

  const openDrawer = useCallback(
    (body: GlobalDrawerState) => {
      dispatch(GlobalDrawerSliceActions.openDrawer(body))
    },
    [dispatch],
  )

  const closeDrawer = useCallback(() => {
    dispatch(GlobalDrawerSliceActions.closeDrawer())
  }, [dispatch])

  return {
    openDrawer,
    closeDrawer,
  }
}
