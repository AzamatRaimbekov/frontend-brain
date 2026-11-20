import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { type GlobalNotificationState, type NotificationProps } from './types'

const initialState: GlobalNotificationState = {
  events: [],
  nextEventId: 0,
}

export const GlobalNotificationSlice = createSlice({
  name: 'GlobalNotificationSlice',
  initialState,
  reducers: {
    openNotification: (state, action: PayloadAction<NotificationProps>) => {
      state.nextEventId += 1
      state.events.push({
        id: state.nextEventId,
        props: action.payload,
      })
    },
    consumeNotification: (state, action: PayloadAction<number>) => {
      if (state.events[0]?.id === action.payload) {
        state.events.shift()
      }
    },
  },
})

export const GlobalNotificationSliceActions = GlobalNotificationSlice.actions

export const globalNotificationSlice = GlobalNotificationSlice.reducer

export interface GlobalNotificationSliceSchema {
  globalNotification: GlobalNotificationState
}
