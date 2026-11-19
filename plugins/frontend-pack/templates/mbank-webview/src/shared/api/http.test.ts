import { http as mock, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { host } from '@/shared/bridge'
import { createMockHost, EXPIRED_TOKEN } from '@/shared/bridge/mockHost'
import { server } from '@/test/server'
import { http, isApiError } from './http'

const echo = mock.get('/api/echo', ({ request }) =>
  HttpResponse.json({ auth: request.headers.get('Authorization'), lang: request.headers.get('Accept-Language') }),
)

describe('http', () => {
  it('sends the app token and language', async () => {
    server.use(echo)
    await host.start(createMockHost({ lang: 'ky' }, 0))
    expect(await http('/api/echo', (d) => d)).toEqual({ auth: 'Bearer mock-token-0', lang: 'ky' })
  })

  it('401 → asks the app for a new token once and repeats the request', async () => {
    await host.start(createMockHost({ token: EXPIRED_TOKEN }, 0))
    const me = await http('/api/me', (d) => d as { name: string })
    expect(me.name).toBe('Айдана')
    expect(host.getState()).toMatchObject({ status: 'ready', token: 'mock-token-1' })
  })

  it('refresh refused → ApiError 401 and the session is over', async () => {
    await host.start(createMockHost({ token: EXPIRED_TOKEN, refreshFails: true }, 0))
    const error = await http('/api/me', (d) => d).catch((e: unknown) => e)
    expect(isApiError(error) && error.status).toBe(401)
    expect(host.getState().status).toBe('expired')
  })

  it('still 401 with a fresh token → the session is over, no endless loop', async () => {
    server.use(mock.get('/api/me', () => new HttpResponse(null, { status: 401 })))
    await host.start(createMockHost({}, 0))
    await expect(http('/api/me', (d) => d)).rejects.toMatchObject({ status: 401 })
    expect(host.getState().status).toBe('expired')
  })
})
