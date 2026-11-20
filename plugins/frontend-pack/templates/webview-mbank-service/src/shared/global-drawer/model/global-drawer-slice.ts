import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { type GlobalDrawerState } from './types'

const initialState: GlobalDrawerState = {
  body: null,
}

export const GlobalDrawerSlice = createSlice({
  name: 'GlobalDrawerSlice',
  initialState,
  reducers: {
    openDrawer: (state, action: PayloadAction<GlobalDrawerState>) => {
      Object.assign(state, action.payload)
    },
    closeDrawer: () => {
      return initialState
    },
  },
})

export interface GlobalDrawerSliceState {
  globalDrawer: GlobalDrawerState
}

export const GlobalDrawerSliceActions = GlobalDrawerSlice.actions

export const globalDrawerSliceReducer = GlobalDrawerSlice.reducer
