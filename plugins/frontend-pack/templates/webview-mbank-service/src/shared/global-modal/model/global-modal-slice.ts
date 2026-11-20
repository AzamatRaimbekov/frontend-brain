import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { useDynamicModuleLoader } from '@shared/hooks/useRedux'

import { GlobalModalState } from './types'

const initialState: GlobalModalState = {
  body: null,
}

export const GlobalModalSlice = createSlice({
  name: 'GlobalModalSlice',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<GlobalModalState>) => {
      Object.assign(state, action.payload)
      document.body.style.overflow = 'hidden'
    },
    closeModal: () => {
      document.body.style.overflow = 'auto'
      return initialState
    },
  },
})

export const GlobalModalSliceActions = GlobalModalSlice.actions

export const globalModalSlice = GlobalModalSlice.reducer

export const GlobalModalSliceState = {
  globalModal: globalModalSlice,
}

export interface GlobalModalSliceSchema {
  globalModal: GlobalModalState
}

export const useGlobalModalSlice = () =>
  useDynamicModuleLoader({
    reducers: {
      globalModal: globalModalSlice,
    },
  })
