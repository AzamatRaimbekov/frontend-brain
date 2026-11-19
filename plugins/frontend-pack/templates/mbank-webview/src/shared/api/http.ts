import { host } from '@/shared/bridge'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const TIMEOUT_MS = 15_000

function send(path: string, init: RequestInit | undefined, token: string | null) {
  const headers = new Headers(init?.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  headers.set('Accept-Language', host.getState().lang)
  const signal = init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(TIMEOUT_MS)]) : AbortSignal.timeout(TIMEOUT_MS)
  return fetch(`${BASE_URL}${path}`, { ...init, headers, signal })
}

/**
 * Every API call goes here: the token from the app, the app language, a timeout.
 * 401 → ask the app for a new token once and repeat; still 401 → the session is over (host shows the screen).
 * The token lives only in memory (host); never put it in localStorage, cookies or URLs.
 */
export async function http<T>(path: string, parse: (data: unknown) => T, init?: RequestInit): Promise<T> {
  let response = await send(path, init, host.getState().token)
  if (response.status === 401) {
    const token = await host.refreshToken()
    if (!token) throw new ApiError(401, 'Session expired')
    response = await send(path, init, token)
    if (response.status === 401) {
      host.expire()
      throw new ApiError(401, 'Session expired')
    }
  }
  if (!response.ok) throw new ApiError(response.status, `Request failed: ${response.status}`)
  if (response.status === 204) return parse(undefined)
  return parse(await response.json())
}
