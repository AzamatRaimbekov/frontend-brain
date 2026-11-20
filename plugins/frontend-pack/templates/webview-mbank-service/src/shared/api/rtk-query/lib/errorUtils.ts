import { hasKey, isArray, isPlainObject } from '@shared/libs/obj'

import { skipNotificationKey } from './transformErrorWithSkip'

// eslint-disable-next-line @typescript-eslint/naming-convention
const DEFAULT_HTTP_STATUS = 'Неизвестный статус'
// eslint-disable-next-line @typescript-eslint/naming-convention
const DEFAULT_ERROR_MESSAGE = 'Ведутся технические работы'

// eslint-disable-next-line @typescript-eslint/naming-convention
const PARTNER_ERROR_CODES = ['pledge_module_service_error']

const isString = (val: unknown): val is string => typeof val === 'string'
const isNumber = (val: unknown): val is number => typeof val === 'number'

/**
 * Проверяет, что значение является строкой или числом
 */
const isDisplayableValue = (input: unknown): input is string | number => {
  return isString(input) || isNumber(input)
}

/**
 * Достает значение статуса, если оно является строкой или числом
 */
const getStatusValue = (status: unknown) => {
  if (isDisplayableValue(status)) {
    return status
  }

  return DEFAULT_HTTP_STATUS
}

/**
 * Достает значение статуса из payload, если оно является строкой или числом
 */
export const getErrorStatus = (payload: unknown) => {
  if (isPlainObject(payload) && hasKey(payload, 'status')) {
    return getStatusValue(payload.status)
  }

  return DEFAULT_HTTP_STATUS
}

/**
 * Рекурсивно достает все значения из объекта/массива и возвращает их в одномерном массиве
 */
const getDeepValues = (input: unknown): unknown[] => {
  if (isArray(input)) {
    return input.flatMap(getDeepValues)
  }

  if (isPlainObject(input)) {
    return Object.values(input).flatMap(getDeepValues)
  }

  return isDisplayableValue(input) ? [input] : []
}

/**
 * Извлекает сообщение об ошибке из payload
 */
export const getErrorMessage = (
  payload: unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) => {
  if (!(isPlainObject(payload) && hasKey(payload, 'data'))) {
    return fallbackMessage
  }

  const { data } = payload
  const values = getDeepValues(data)

  return values?.length > 0 ? values.join(' ') : fallbackMessage
}

/**
 * Извлекает флаг пропуска уведомления
 */
export const getSkippedNotification = (payload: unknown) => {
  if (isPlainObject(payload) && hasKey(payload, skipNotificationKey)) {
    return Boolean(payload[skipNotificationKey])
  }

  return false
}

type ExtractStringKeys<T> = Extract<keyof T, string>

export interface FieldError<T = string> {
  name: T
  errors: string[]
}

/**
 * Собирает ошибки для одного свойства, если имя в keys и значение валидно
 */
const extractErrors = (
  prop: string,
  value: unknown,
  keys: string[],
): FieldError[] => {
  if (!keys.includes(prop)) {
    return []
  }

  if (isString(value)) {
    return [{ name: prop, errors: [value] }]
  }

  if (isArray(value) && value.every(isString)) {
    return [{ name: prop, errors: value }]
  }

  return []
}

/**
 * Рекурсивно обходит объект/массив и собирает все FieldError по ключам
 */
const traverse = (node: unknown, keys: string[]): FieldError[] => {
  if (isPlainObject(node)) {
    return Object.entries(node).flatMap(([prop, value]) => {
      const errorsHere = extractErrors(prop, value, keys)
      const nestedErrors = traverse(value, keys)
      return [...errorsHere, ...nestedErrors]
    })
  }

  if (isArray(node)) {
    return node.flatMap((item) => traverse(item, keys))
  }

  return []
}

/**
 * Извлекает массив ошибок валидации Ant Form из payload по списку ключей любой вложенности
 */
export const getValidationErrors = <T>(
  payload: unknown,
  keys: ExtractStringKeys<T>[],
) => {
  if (
    !isPlainObject(payload) ||
    !hasKey(payload, 'data') ||
    !isPlainObject(payload.data)
  ) {
    return []
  }

  const { data } = payload

  const result = traverse(data, keys)

  return result as FieldError<ExtractStringKeys<T>>[]
}

interface ErrorItem {
  detail?: string
  code?: string
}

interface ErrorResponse {
  errors?: ErrorItem[]
}

export const extractErrorDetails = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    Array.isArray((error as { errors?: unknown }).errors)
  ) {
    return ((error as ErrorResponse).errors ?? [])
      .map((e) => e.detail || '')
      .filter((d) => d)
      .join('\n')
  }
  return DEFAULT_ERROR_MESSAGE
}
export const logPartnerError = (error: unknown): boolean => {
  if (
    typeof error === 'object' &&
    error !== null &&
    Array.isArray((error as { errors?: unknown }).errors)
  ) {
    const errors = (error as ErrorResponse).errors ?? []

    return errors.some((e) => PARTNER_ERROR_CODES.includes(e?.code || ''))
  }

  return false
}
