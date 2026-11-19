import { TIMEOUTS, parseMessage, type BridgeEvent, type BridgeMethod, type BridgeRequest } from './protocol'

export class BridgeError extends Error {
  readonly code: string

  constructor(code: string, message = code) {
    super(message)
    this.name = 'BridgeError'
    this.code = code
  }
}

/** How messages travel: `post` sends one to the app, `listen` receives raw ones and returns unsubscribe. */
export type Transport = {
  kind: string
  post: (request: BridgeRequest) => void
  listen: (receive: (raw: unknown) => void) => () => void
}

export type Channel = {
  request: <T>(method: BridgeMethod, params?: Record<string, unknown>, timeoutMs?: number) => Promise<T>
  notify: (method: BridgeMethod, params?: Record<string, unknown>) => void
  onEvent: (listener: (event: BridgeEvent) => void) => () => void
  dispose: () => void
}

let counter = 0
const nextId = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`

/** Request/response and events on top of any transport. Late, duplicate and foreign messages are dropped. */
export function createChannel(transport: Transport): Channel {
  const pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: number }>()
  const listeners = new Set<(event: BridgeEvent) => void>()

  const stop = transport.listen((raw) => {
    const message = parseMessage(raw)
    if (!message) return
    if ('event' in message) {
      listeners.forEach((listener) => listener(message))
      return
    }
    const waiting = pending.get(message.id)
    if (!waiting) return
    pending.delete(message.id)
    window.clearTimeout(waiting.timer)
    if (message.error) waiting.reject(new BridgeError(message.error.code, message.error.message))
    else waiting.resolve(message.result)
  })

  return {
    request(method, params, timeoutMs = TIMEOUTS[method as keyof typeof TIMEOUTS] ?? TIMEOUTS.default) {
      const id = nextId()
      return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => {
          pending.delete(id)
          reject(new BridgeError('timeout', `Bridge method ${method} did not answer in ${timeoutMs} ms`))
        }, timeoutMs)
        pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer })
        try {
          transport.post({ v: 1, id, method, params })
        } catch (error) {
          pending.delete(id)
          window.clearTimeout(timer)
          reject(new BridgeError('post_failed', error instanceof Error ? error.message : String(error)))
        }
      })
    },
    notify(method, params) {
      try {
        transport.post({ v: 1, id: nextId(), method, params })
      } catch {
        // A one-way message (close, openUrl) has nobody to report to; the app may already be gone.
      }
    },
    onEvent(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    dispose() {
      stop()
      pending.forEach(({ reject, timer }) => {
        window.clearTimeout(timer)
        reject(new BridgeError('disposed'))
      })
      pending.clear()
      listeners.clear()
    },
  }
}
