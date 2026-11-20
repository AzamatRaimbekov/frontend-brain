import { $RTKClientAPI, PropsState } from '@shared/api/rtk-query'

import { authSliceActions } from './slice'
import { type LoginReq, UserData } from './types'

export const authApiRTK = $RTKClientAPI
  .enhanceEndpoints({
    addTagTypes: ['auth'],
  })
  .injectEndpoints({
    endpoints: (build) => ({
      login: build.mutation<void, PropsState<LoginReq>>({
        query: ({ body }) => ({
          url: '/auth/mbank-token',
          method: 'POST',
          body,
        }),
      }),
      me: build.query<UserData, void>({
        query: () => ({
          url: '/auth/me',
          method: 'GET',
        }),
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          const { data: user } = await queryFulfilled
          dispatch(authSliceActions.setUserData(user))
        },
      }),
    }),
  })

export const { useLazyMeQuery, useLoginMutation } = authApiRTK
