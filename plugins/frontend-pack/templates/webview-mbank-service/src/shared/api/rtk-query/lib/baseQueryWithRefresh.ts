import { authSliceActions } from '@modules/Auth'
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react'
import { TokenStorage } from '@shared/libs/storage'

import { $baseQuery } from './baseQuery'
import { refreshTokenRequest } from './refreshToken'

export const $baseQueryWithRefresh: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const lang = TokenStorage.getFromStorage('lang', false) || 'ru'
  const modifiedArgs = {
    ...(typeof args === 'string' ? { url: args } : args),
    headers: {
      'Accept-Language': lang,
    },
  }
  let result = await $baseQuery(modifiedArgs, api, extraOptions)

  if (result.error?.status === 401) {
    const token = TokenStorage.getFromStorage()

    const refreshResult = await refreshTokenRequest(
      { token },
      api,
      extraOptions,
    )

    if (refreshResult.data?.success) {
      result = await $baseQuery(modifiedArgs, api, extraOptions)
    } else {
      if (
        refreshResult.error?.status === 400 ||
        refreshResult.error?.status === 401
      ) {
        TokenStorage.deleteStorage()
        api.dispatch(authSliceActions.destroyAuth())
      }

      return refreshResult
    }
  }

  return result
}
