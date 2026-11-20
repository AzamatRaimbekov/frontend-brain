import { createSelector } from '@reduxjs/toolkit'

export const authSelector = (state: RootState) => state.auth

export const userSelector = createSelector(
  authSelector,
  (auth) => auth.userData,
)
