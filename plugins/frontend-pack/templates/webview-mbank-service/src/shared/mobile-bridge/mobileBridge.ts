import * as Sentry from '@sentry/react'

import { getMobileBridgeDevMode } from './lib/devMode'
import { getMockMobileBridgeResult } from './lib/getMockMobileBridgeResult'
import {
  type MobileBridgeCallArgs,
  type MobileBridgeErrorCode,
  type MobileBridgeErrorPayload,
  type MobileBridgeEventType,
  type MobileBridgeJsonObject,
  type MobileBridgeJsonValue,
  type MobileBridgeNativeApi,
  type MobileBridgePayload,
  type MobileBridgeResponse,
  type MobileBridgeResult,
  type MobileBridgeStatus,
} from './types'

const SupportedMobileBridgeVersion = 1
const DefaultBridgeUnavailableRetries = 3
const DefaultRetryDelayMs = 1000

const MobileBridgeErrorCodes = new Set<MobileBridgeErrorCode>([
  'bridgeUnavailable',
  'invalidEnvelope',
  'invalidPayload',
  'unsupportedVersion',
  'unsupportedAction',
  'forbiddenOrigin',
  'invalidNonce',
  'missingCapability',
  'duplicateMessage',
  'handlerFailed',
])

export interface MobileBridgeCallOptions {
  bridgeUnavailableRetries?: number
  retryDelayMs?: number
}

export class MobileBridgeInvokeError extends Error {
  code: MobileBridgeErrorCode
  details?: unknown

  constructor(error: MobileBridgeErrorPayload) {
    super(error.message || getMobileBridgeErrorMessage(error.code))
    this.name = 'MobileBridgeInvokeError'
    this.code = error.code
    this.details = error.details
  }
}

export const isMobileBridgeInvokeError = (
  error: unknown,
): error is MobileBridgeInvokeError => error instanceof MobileBridgeInvokeError

export const isMobileBridgeErrorCode = (
  code: unknown,
): code is MobileBridgeErrorCode =>
  typeof code === 'string' && MobileBridgeErrorCodes.has(code as never)

export const getMobileBridgeErrorMessage = (code: MobileBridgeErrorCode) => {
  const messages: Record<MobileBridgeErrorCode, string> = {
    bridgeUnavailable:
      'Приложение пока не готово выполнить действие. Попробуйте еще раз.',
    invalidEnvelope:
      'Не удалось подготовить запрос для приложения. Попробуйте позже.',
    invalidPayload:
      'Данные для действия заполнены некорректно. Попробуйте позже.',
    unsupportedVersion:
      'Ваша версия приложения MBANK не поддерживает это действие. Обновите приложение.',
    unsupportedAction:
      'Это действие пока не поддерживается в текущей версии приложения.',
    forbiddenOrigin:
      'Сервис пока не согласован для выполнения этого действия в приложении.',
    invalidNonce:
      'Не удалось выполнить действие. Попробуйте открыть сервис заново.',
    missingCapability:
      'Для сервиса еще не подключено разрешение на это действие.',
    duplicateMessage:
      'Такое действие уже отправлено в приложение. Подождите немного.',
    handlerFailed: 'Приложение не смогло выполнить действие. Попробуйте позже.',
  }

  return messages[code]
}

export const getMobileBridgeStatus = (): MobileBridgeStatus => {
  const devMode = getMobileBridgeDevMode()

  if (devMode !== 'native') {
    return {
      available: true,
      version: SupportedMobileBridgeVersion,
      devMode,
    }
  }

  if (typeof window === 'undefined') {
    return {
      available: false,
      reason: 'windowUnavailable',
    }
  }

  const bridge = window.MBankBridge

  if (!bridge) {
    return {
      available: false,
      reason: 'bridgeUnavailable',
    }
  }

  if (bridge.version !== SupportedMobileBridgeVersion) {
    return {
      available: false,
      reason: 'unsupportedVersion',
      version: bridge.version,
    }
  }

  return {
    available: true,
    version: SupportedMobileBridgeVersion,
  }
}

export const getMobileBridge = (): MobileBridgeNativeApi | null => {
  const status = getMobileBridgeStatus()

  if (!status.available) {
    return null
  }

  return window.MBankBridge || null
}

const wait = (delayMs: number) =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, delayMs)
  })

const logMobileBridgeError = (
  type: MobileBridgeEventType,
  error: MobileBridgeErrorPayload,
) => {
  Sentry.captureException(new MobileBridgeInvokeError(error), {
    tags: {
      source: 'mbank-webview-bridge',
      bridgeEventType: type,
      bridgeErrorCode: error.code,
    },
    extra: {
      details: error.details,
    },
  })
}

const createUnavailableError = (): MobileBridgeErrorPayload => {
  const status = getMobileBridgeStatus()
  const isUnsupportedVersion =
    !status.available && status.reason === 'unsupportedVersion'

  return {
    code: isUnsupportedVersion ? 'unsupportedVersion' : 'bridgeUnavailable',
    message: getMobileBridgeErrorMessage(
      isUnsupportedVersion ? 'unsupportedVersion' : 'bridgeUnavailable',
    ),
    details: status,
  }
}

export async function callMobileResponse<TType extends MobileBridgeEventType>(
  type: TType,
  ...args: [...MobileBridgeCallArgs<TType>, options?: MobileBridgeCallOptions]
): Promise<MobileBridgeResponse<MobileBridgeResult<TType>>> {
  const devMode = getMobileBridgeDevMode()

  if (devMode !== 'native') {
    return {
      ok: true,
      result: getMockMobileBridgeResult(type),
    }
  }

  const payload = args[0] as MobileBridgePayload<TType> | undefined
  const options = args[1] as MobileBridgeCallOptions | undefined
  const bridgeUnavailableRetries =
    options?.bridgeUnavailableRetries ?? DefaultBridgeUnavailableRetries
  const retryDelayMs = options?.retryDelayMs ?? DefaultRetryDelayMs
  let lastError: MobileBridgeErrorPayload | null = null

  for (let attempt = 0; attempt <= bridgeUnavailableRetries; attempt += 1) {
    const bridge = getMobileBridge()

    if (!bridge) {
      lastError = createUnavailableError()
    } else {
      const response = await bridge.invoke<MobileBridgeResult<TType>>(
        type,
        (payload || {}) as MobileBridgeJsonObject,
      )

      if (response.ok) {
        return response
      }

      lastError = response.error
    }

    if (
      lastError.code !== 'bridgeUnavailable' ||
      attempt === bridgeUnavailableRetries
    ) {
      return {
        ok: false,
        error: lastError,
      }
    }

    await wait(retryDelayMs)
  }

  const fallbackError = lastError || createUnavailableError()

  return {
    ok: false,
    error: fallbackError,
  }
}

export async function callMobile<TType extends MobileBridgeEventType>(
  type: TType,
  ...args: [...MobileBridgeCallArgs<TType>, options?: MobileBridgeCallOptions]
): Promise<MobileBridgeResult<TType>> {
  const response = await callMobileResponse(type, ...args)

  if (response.ok) {
    return response.result
  }

  logMobileBridgeError(type, response.error)
  throw new MobileBridgeInvokeError(response.error)
}

export const closeMobileWebView = (payload: MobileBridgeJsonObject = {}) =>
  callMobile('app.close', payload)

export const requestMobileAuth = (redirectUrl?: string) =>
  callMobile('auth.required', redirectUrl ? { redirectUrl } : {})

export const startMobilePayment = (
  payload: MobileBridgePayload<'payment.start'>,
) => callMobile('payment.start', payload)

export const shareMobileText = (text: string) =>
  callMobile('share.text', { text })

export const previewMobilePdfUrl = (url: string) =>
  callMobile('pdf.previewUrl', { url })

export const previewMobilePdfBase64 = (base64: string, fileName?: string) =>
  callMobile('pdf.previewBase64', fileName ? { base64, fileName } : { base64 })

export const openExternalMobileUrl = (url: string) =>
  callMobile('external.open', { url })

export const openDeepLink = (url: string) =>
  callMobile('deepLink.open', { url })

export const logFirebaseAnalyticsEvent = (
  name: string,
  parameters?: MobileBridgeJsonObject,
) =>
  callMobile(
    'firebaseAnalytics.logEvent',
    parameters ? { name, parameters } : { name },
  )

export const setFirebaseAnalyticsUserProperty = (name: string, value: string) =>
  callMobile('firebaseAnalytics.setUserProperty', { name, value })

export const logAdjustEvent = (token: string, key: string, value?: string) =>
  callMobile('adjust.logEvent', value ? { token, key, value } : { token, key })

export const isMobileBiometryAvailable = () =>
  callMobile('biometry.isAvailable')

export const saveMobileBiometryValue = (value: MobileBridgeJsonValue) =>
  callMobile('biometry.save', { value })

export const readMobileBiometryValue = () => callMobile('biometry.read')

export const getMobileDeviceReport = () => callMobile('device.report')
