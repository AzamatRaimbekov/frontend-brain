import type { Transport } from './channel'
import type { BridgeRequest } from './protocol'

// Names the native app uses. Change them here only, when the mobile team fixes the real ones.
type NativeWindow = Window & {
  webkit?: { messageHandlers?: { mbank?: { postMessage: (message: unknown) => void } } }
  MbankAndroid?: { postMessage: (message: string) => void }
  ReactNativeWebView?: { postMessage: (message: string) => void }
  mbankBridgeReceive?: (message: unknown) => void
}

/** Finds how to send to the app: iOS WKWebView, Android JavascriptInterface or React Native. */
export function findNativePost(win: NativeWindow = window): ((request: BridgeRequest) => void) | null {
  const ios = win.webkit?.messageHandlers?.mbank
  if (ios) return (request) => ios.postMessage(request)
  const android = win.MbankAndroid
  if (android) return (request) => android.postMessage(JSON.stringify(request))
  const reactNative = win.ReactNativeWebView
  if (reactNative) return (request) => reactNative.postMessage(JSON.stringify(request))
  return null
}

/**
 * The app answers by calling `window.mbankBridgeReceive(message)` (string or object) or by a `message`
 * event (React Native fires it on window on iOS and on document on Android).
 */
export function nativeTransport(post: (request: BridgeRequest) => void, win: NativeWindow = window): Transport {
  return {
    kind: 'native',
    post,
    listen(receive) {
      const onMessage = (event: Event) => receive((event as MessageEvent).data)
      win.mbankBridgeReceive = receive
      win.addEventListener('message', onMessage)
      win.document.addEventListener('message', onMessage)
      return () => {
        if (win.mbankBridgeReceive === receive) delete win.mbankBridgeReceive
        win.removeEventListener('message', onMessage)
        win.document.removeEventListener('message', onMessage)
      }
    },
  }
}

/**
 * Launch parameters in the URL hash: `#token=…&lang=ky&theme=dark`. The hash never reaches the server
 * or its logs; it is removed from the address bar at once so the token does not stay in history.
 */
export function readLaunchParams(win: Window = window): Record<string, string> | null {
  const hash = win.location.hash.replace(/^#/, '')
  if (!hash.includes('token=')) return null
  const params = Object.fromEntries(new URLSearchParams(hash))
  const url = new URL(win.location.href)
  url.hash = ''
  win.history.replaceState(win.history.state, '', url.pathname + url.search)
  return params
}
