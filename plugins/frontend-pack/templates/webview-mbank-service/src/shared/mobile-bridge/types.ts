export type MobileBridgeJsonPrimitive = string | number | boolean | null

export type MobileBridgeJsonValue =
  | MobileBridgeJsonPrimitive
  | MobileBridgeJsonObject
  | MobileBridgeJsonValue[]

export interface MobileBridgeJsonObject {
  [key: string]: MobileBridgeJsonValue
}

export type MobileBridgeErrorCode =
  | 'bridgeUnavailable'
  | 'invalidEnvelope'
  | 'invalidPayload'
  | 'unsupportedVersion'
  | 'unsupportedAction'
  | 'forbiddenOrigin'
  | 'invalidNonce'
  | 'missingCapability'
  | 'duplicateMessage'
  | 'handlerFailed'

export interface MobileBridgeErrorPayload {
  code: MobileBridgeErrorCode
  message?: string
  details?: MobileBridgeJsonValue
}

export interface MobileBridgeSuccessResponse<TResult> {
  ok: true
  id?: string
  result: TResult
}

export interface MobileBridgeErrorResponse {
  ok: false
  id?: string
  error: MobileBridgeErrorPayload
}

export type MobileBridgeResponse<TResult> =
  | MobileBridgeSuccessResponse<TResult>
  | MobileBridgeErrorResponse

export interface MobileBridgeNativeApi {
  version: number
  invoke: <TResult = unknown>(
    type: string,
    payload?: MobileBridgeJsonObject,
  ) => Promise<MobileBridgeResponse<TResult>>
}

export interface MobilePaymentStartPayload {
  serviceId: string
  code: string
  amount?: string
  resultUrl?: string
  parameters?: MobileBridgeJsonObject
}

export interface MobileBridgeEventMap {
  'app.close': {
    payload: MobileBridgeJsonObject
    result: MobileBridgeJsonValue
  }
  'auth.required': {
    payload: MobileBridgeJsonObject & {
      redirectUrl?: string
    }
    result: MobileBridgeJsonValue
  }
  'payment.start': {
    payload: MobileBridgeJsonObject & MobilePaymentStartPayload
    result: MobileBridgeJsonValue
  }
  'share.text': {
    payload: MobileBridgeJsonObject & {
      text: string
    }
    result: MobileBridgeJsonValue
  }
  'pdf.previewUrl': {
    payload: MobileBridgeJsonObject & {
      url: string
    }
    result: MobileBridgeJsonValue
  }
  'pdf.previewBase64': {
    payload: MobileBridgeJsonObject & {
      base64: string
      fileName?: string
    }
    result: MobileBridgeJsonValue
  }
  'external.open': {
    payload: MobileBridgeJsonObject & {
      url: string
    }
    result: MobileBridgeJsonValue
  }
  'deepLink.open': {
    payload: MobileBridgeJsonObject & {
      url: string
    }
    result: MobileBridgeJsonValue
  }
  'firebaseAnalytics.logEvent': {
    payload: MobileBridgeJsonObject & {
      name: string
      parameters?: MobileBridgeJsonObject
    }
    result: MobileBridgeJsonValue
  }
  'firebaseAnalytics.setUserProperty': {
    payload: MobileBridgeJsonObject & {
      name: string
      value: string
    }
    result: MobileBridgeJsonValue
  }
  'adjust.logEvent': {
    payload: MobileBridgeJsonObject & {
      token: string
      key: string
      value?: string
    }
    result: MobileBridgeJsonValue
  }
  'biometry.isAvailable': {
    payload: undefined
    result: {
      available: boolean
    }
  }
  'biometry.save': {
    payload: MobileBridgeJsonObject & {
      value: MobileBridgeJsonValue
    }
    result: MobileBridgeJsonValue
  }
  'biometry.read': {
    payload: undefined
    result: {
      value: string | null
    }
  }
  'device.report': {
    payload: undefined
    result: {
      report: string | null
    }
  }
}

export type MobileBridgeEventType = keyof MobileBridgeEventMap

export type MobileBridgePayload<TType extends MobileBridgeEventType> =
  MobileBridgeEventMap[TType]['payload']

export type MobileBridgeResult<TType extends MobileBridgeEventType> =
  MobileBridgeEventMap[TType]['result']

export type MobileBridgeCallArgs<TType extends MobileBridgeEventType> =
  MobileBridgePayload<TType> extends undefined
    ? [payload?: undefined]
    : [payload: MobileBridgePayload<TType>]

export type MobileBridgeStatus =
  | {
      available: true
      version: 1
      devMode?: 'mock' | 'disabled'
    }
  | {
      available: false
      reason: 'windowUnavailable' | 'bridgeUnavailable' | 'unsupportedVersion'
      version?: number
    }
