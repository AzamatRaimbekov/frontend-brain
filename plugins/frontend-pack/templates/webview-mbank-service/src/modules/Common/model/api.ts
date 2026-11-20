import { closeMobileWebView } from '@shared/mobile-bridge/mobileBridge'

export const commonApi = {
  closeApp: () => {
    return closeMobileWebView()
  },
}
