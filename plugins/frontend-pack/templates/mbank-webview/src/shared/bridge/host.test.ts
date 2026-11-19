import { afterEach, describe, expect, it, vi } from 'vitest'
import { createChannel } from './channel'
import { createHost } from './host'
import { createMockHost, EXPIRED_TOKEN } from './mockHost'
import { parseMessage, toLang } from './protocol'

const fresh = () => createHost()

afterEach(() => {
  vi.useRealTimers()
  window.history.replaceState(null, '', '/')
})

describe('protocol', () => {
  it('drops junk, other versions and broken JSON', () => {
    expect(parseMessage('{oops')).toBeNull()
    expect(parseMessage({ v: 2, id: 'a' })).toBeNull()
    expect(parseMessage(42)).toBeNull()
    expect(parseMessage('{"v":1,"event":"back"}')).toEqual({ v: 1, event: 'back' })
  })

  it('maps languages to ru, ky, en with ru as the fallback', () => {
    expect(toLang('ky-KG')).toBe('ky')
    expect(toLang('EN')).toBe('en')
    expect(toLang('de')).toBe('ru')
    expect(toLang(undefined)).toBe('ru')
  })
})

describe('host', () => {
  it('connects to the app and takes token, language and theme from init', async () => {
    const host = fresh()
    await host.start(createMockHost({ lang: 'ky', theme: 'dark' }, 0))
    expect(host.getState()).toMatchObject({ status: 'ready', source: 'mock', token: 'mock-token-0', lang: 'ky', theme: 'dark' })
  })

  it('follows language, theme and token events from the app', async () => {
    const host = fresh()
    const app = createMockHost({}, 0)
    await host.start(app)
    app.setLang('en')
    app.setTheme('dark')
    await vi.waitFor(() => expect(host.getState()).toMatchObject({ lang: 'en', theme: 'dark' }))
  })

  it('init without a token means the session is over', async () => {
    const host = fresh()
    await host.start(createMockHost({ token: '' }, 0))
    expect(host.getState().status).toBe('expired')
  })

  it('an app that never answers init → failed after the timeout, retry tries again', async () => {
    vi.useFakeTimers()
    const host = fresh()
    const app = createMockHost({}, 0)
    const post = app.post
    app.post = () => {}
    const started = host.start(app)
    await vi.advanceTimersByTimeAsync(3000)
    await started
    expect(host.getState().status).toBe('failed')
    app.post = post
    const retried = host.retry()
    await vi.advanceTimersByTimeAsync(1)
    await retried
    expect(host.getState().status).toBe('ready')
  })

  it('parallel refreshes share one request to the app', async () => {
    const host = fresh()
    const app = createMockHost({}, 0)
    await host.start(app)
    const post = vi.spyOn(app, 'post')
    const [a, b] = await Promise.all([host.refreshToken(), host.refreshToken()])
    expect(a).toBe('mock-token-1')
    expect(b).toBe('mock-token-1')
    expect(post.mock.calls.filter(([r]) => r.method === 'refreshToken')).toHaveLength(1)
  })

  it('a failed refresh ends the session', async () => {
    const host = fresh()
    await host.start(createMockHost({ token: EXPIRED_TOKEN, refreshFails: true }, 0))
    expect(await host.refreshToken()).toBeNull()
    expect(host.getState()).toMatchObject({ status: 'expired', token: null })
  })

  it('launch params in the hash: ready, and the token is wiped from the address bar', async () => {
    window.history.replaceState(null, '', '/pay?x=1#token=abc&lang=ky&theme=dark')
    const host = fresh()
    await host.start()
    expect(host.getState()).toMatchObject({ status: 'ready', source: 'launch', token: 'abc', lang: 'ky', theme: 'dark' })
    expect(window.location.href).not.toContain('abc')
    expect(window.location.pathname + window.location.search).toBe('/pay?x=1')
    expect(await host.refreshToken()).toBeNull()
  })

  it('no bridge and no launch params → standalone', async () => {
    const host = fresh()
    await host.start()
    expect(host.getState().status).toBe('standalone')
  })

  it('back: newest screen handler first, then the router, then the app closes the WebView', async () => {
    const host = fresh()
    const app = createMockHost({}, 0)
    await host.start(app)
    const calls: string[] = []
    const stop = host.onBack(() => (calls.push('sheet'), true))
    host.setFallbackBack(() => (calls.push('router'), false))
    app.emit({ event: 'back' })
    await vi.waitFor(() => expect(calls).toEqual(['sheet']))
    stop()
    app.emit({ event: 'back' })
    await vi.waitFor(() => expect(app.state.closed).toBe(true))
    expect(calls).toEqual(['sheet', 'router'])
  })
})

describe('channel', () => {
  it('ignores late and foreign responses', async () => {
    let receive: (raw: unknown) => void = () => {}
    const channel = createChannel({ kind: 'x', post: () => {}, listen: (r) => ((receive = r), () => {}) })
    const answer = channel.request('init', undefined, 50)
    receive({ v: 1, id: 'someone-else', result: 1 })
    await expect(answer).rejects.toMatchObject({ code: 'timeout' })
  })
})
