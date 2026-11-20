// Compile-time usage contract for the bridge helper.
// This file is included by TypeScript to catch accidental API/type regressions.
import {
  type MobileBridgeErrorCode,
  type MobileBridgeEventMap,
  callMobile,
  callMobileResponse,
  closeMobileWebView,
  getMobileBridgeDevMode,
  getMobileBridgeStatus,
  isMobileBridgeErrorCode,
  isMobileBridgeInvokeError,
  openDeepLink,
  startMobilePayment,
} from './index'

type Assert<T extends true> = T
type IsAssignable<T, U> = T extends U ? true : false

export type MobileBridgeContractEventNames = Assert<
  IsAssignable<
    'app.close' | 'payment.start' | 'biometry.read' | 'device.report',
    keyof MobileBridgeEventMap
  >
>

export type MobileBridgeContractErrorCodes = Assert<
  IsAssignable<'bridgeUnavailable' | 'missingCapability', MobileBridgeErrorCode>
>

export const mobileBridgeContractUsage = async () => {
  const status = getMobileBridgeStatus()
  const devMode = getMobileBridgeDevMode()

  if (status.available || devMode === 'mock') {
    await callMobile('share.text', { text: 'hello' })
    const response = await callMobileResponse('share.text', { text: 'hello' })

    if (!response.ok) {
      isMobileBridgeErrorCode(response.error.code)
    }

    await closeMobileWebView({ status: 'cancelled' })
    await openDeepLink('mbank://service/example')
    await startMobilePayment({
      serviceId: 'service',
      code: 'order-id',
      amount: '100',
      parameters: { source: 'webview' },
    })
  }

  return isMobileBridgeErrorCode('handlerFailed')
}

export const mobileBridgeContractErrorUsage = (error: unknown) => {
  if (!isMobileBridgeInvokeError(error)) {
    return null
  }

  return {
    code: error.code,
    details: error.details,
    message: error.message,
  }
}
