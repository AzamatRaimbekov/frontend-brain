import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
  type QueryReturnValue,
} from '@reduxjs/toolkit/query/react'
import { apiPaths } from '@shared/model/apiPaths'

import { $baseQuery } from './baseQuery'

// Тип успешного ответа при обновлении токена
export interface RefreshTokenSuccessResponse {
  success: boolean
  access_token?: string
  refresh_token?: string
}

// Тип аргументов для запроса на обновление токена
export interface RefreshTokenArg {
  token?: string // Теперь токен можно не передавать вручную
}

// Унифицированный тип результата запроса обновления токена
export type RefreshTokenQueryResult = QueryReturnValue<
  RefreshTokenSuccessResponse,
  FetchBaseQueryError,
  FetchBaseQueryMeta
>

// Ответ при отсутствии токена
export const tokenError: RefreshTokenQueryResult = {
  error: {
    status: 401,
    data: {
      message: 'Токен отсутствует',
      code: 'MISSING_TOKEN',
    },
  },
}

let refreshPromise: Promise<RefreshTokenQueryResult> | null = null

const getRefreshTokenFromCookie = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)refresh_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export const refreshTokenRequest: BaseQueryFn<
  RefreshTokenArg,
  RefreshTokenSuccessResponse,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
> = async (_, api, extraOptions) => {
  const cookieToken = getRefreshTokenFromCookie()

  if (!cookieToken) {
    return tokenError
  }
  const request: FetchArgs = {
    url: apiPaths.user.refresh,
    method: 'POST',
    body: { refresh_token: cookieToken },
  }

  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = $baseQuery(
    request,
    api,
    extraOptions,
  ) as Promise<RefreshTokenQueryResult>

  try {
    const result = await refreshPromise
    return result
  } finally {
    refreshPromise = null // Сброс, чтобы в будущем можно было снова обновить токен
  }
}
