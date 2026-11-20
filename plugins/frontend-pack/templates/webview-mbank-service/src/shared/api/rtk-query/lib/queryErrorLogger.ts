import { type Middleware, isRejectedWithValue } from '@reduxjs/toolkit'
import { GlobalNotificationSliceActions } from '@shared/notification'

import {
  extractErrorDetails,
  getSkippedNotification,
  logPartnerError,
} from './errorUtils'

export interface ErrorData {
  message?: string
  [key: string]: unknown
}

interface RejectedPayload {
  status: number | string
  data?: ErrorData
  error?: string
}

interface ErrorMessage {
  title?: string
  description: string
}
export interface ErrorItem {
  code: string
  detail: string
  attr: string | null
}

const getErrorNotification = (status: number | string, message: string) => {
  const isServerError =
    typeof status === 'number' && status >= 500 && status <= 599

  const messages: Record<string, ErrorMessage> = {
    400: {
      description: message,
    },
    401: {
      description: `Пожалуйста, войдите в аккаунт. ${message}`,
    },
    403: { description: `У вас нет доступа к этому разделу. ${message}` },
    404: { description: `Ничего не найдено. ${message}` },
    409: { description: `Данные уже изменились. Попробуйте снова. ${message}` },
    422: {
      description: `Проверьте введённые данные и попробуйте снова. ${message}`,
    },
    500: {
      description: `Что-то пошло не так. ${message}`,
    },
    TIMEOUT_ERROR: {
      title: 'Проблема с интернет-соединением',
      description: 'Проверьте подключение к интернету и попробуйте снова.',
    },
    FETCH_ERROR: {
      title: 'Проблема с интернет-соединением',
      description:
        'Похоже, сейчас нет доступа к интернету. Проверьте подключение и попробуйте снова.',
    },
    PARSING_ERROR: {
      title: 'Не удалось загрузить данные',
      description: 'Идет обновление сервиса. Пожалуйста зайдите позже',
    },
    CUSTOM_ERROR: {
      title: 'Не удалось выполнить действие',
      description: message,
    },
  }
  if (isServerError) {
    return {
      message: 'Технические работы',
      description: 'Пожалуйста, попробуйте позже',
      type: 'info' as const,
    }
  }

  const error = messages[status] || {
    title: `Проблема ${status || 'Неизвестный статус'}`,
    description: message,
  }

  return {
    message: error.title,
    description: error.description,
    type: 'info' as const,
  }
}

export const $rtkQueryErrorLogger: Middleware =
  (store) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      const payload = action.payload as RejectedPayload
      const isPartnerError = logPartnerError(payload.data)
      const skipped = getSkippedNotification(payload)

      if (skipped || isPartnerError) {
        if (isPartnerError) {
          window.location.href = '/partner-error'
        }
        return next(action)
      }

      const errorMessage =
        payload.status === 'CUSTOM_ERROR' && payload.error
          ? payload.error
          : extractErrorDetails(payload.data)
      const notificationProps = getErrorNotification(
        payload.status,
        errorMessage,
      )

      store.dispatch(
        GlobalNotificationSliceActions.openNotification(notificationProps),
      )
    }

    return next(action)
  }
