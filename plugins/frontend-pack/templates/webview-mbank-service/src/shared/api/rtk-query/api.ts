import { createApi } from '@reduxjs/toolkit/query/react'

import { $baseQueryWithRefresh } from './lib'

export const $RTKClientAPI = createApi({
  reducerPath: 'RTKClientAPI',
  baseQuery: $baseQueryWithRefresh,
  endpoints: () => ({}),
})
