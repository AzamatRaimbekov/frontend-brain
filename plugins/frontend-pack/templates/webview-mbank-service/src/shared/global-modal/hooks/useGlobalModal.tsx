import { useAppDispatch } from '@shared/hooks/useRedux'

import { GlobalModalSliceActions } from '../model/global-modal-slice'
import { GlobalModalState } from '../model/types'

export const useGlobalModal = () => {
  const dispatch = useAppDispatch()

  const openModal = (body: GlobalModalState) => {
    dispatch(GlobalModalSliceActions.openModal(body))
  }

  const closeModal = () => {
    dispatch(GlobalModalSliceActions.closeModal())
  }

  return {
    openModal,
    closeModal,
  }
}
