import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import { BaseApiDomain } from '@shared/config/base/base-url'

export const $baseQuery = fetchBaseQuery({
  baseUrl: BaseApiDomain,
  credentials: 'include',
  timeout: 60 * 1000,
})
