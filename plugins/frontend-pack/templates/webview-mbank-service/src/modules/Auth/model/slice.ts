import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { type AuthState, UserData } from './types'

const initialState: AuthState = {
  userData: null,
}

export const AuthSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.userData = action.payload
    },
    destroyAuth: () => {
      window.location.href = '/'
      return initialState
    },
  },
})

export interface AuthSliceSchema {
  auth: AuthState
}

export const { actions: authSliceActions } = AuthSlice

export const authReducer = {
  auth: AuthSlice.reducer,
}
