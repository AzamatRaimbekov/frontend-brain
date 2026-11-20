import { type FetchBaseQueryError } from '@reduxjs/toolkit/query'

export type ErrorStatus = string | number

export const skipNotificationKey = '__skipNotification' as const

export const transformErrorWithSkip = (
  error: FetchBaseQueryError,
  conditionFn: (error: FetchBaseQueryError) => boolean,
) => {
  if (conditionFn(error)) {
    return {
      ...error,
      [skipNotificationKey]: true,
    }
  }

  return error
}

export const skipStatusFn = (
  error: FetchBaseQueryError,
  statusList: ErrorStatus[],
) => !!error?.status && statusList.includes(error.status)

export const transformErrorWithSkipStatus = (
  error: FetchBaseQueryError,
  statusList: ErrorStatus[],
) => transformErrorWithSkip(error, (error) => skipStatusFn(error, statusList))

export const createErrorSkipper =
  (statusList: ErrorStatus[]) => (error: FetchBaseQueryError) =>
    transformErrorWithSkipStatus(error, statusList)
