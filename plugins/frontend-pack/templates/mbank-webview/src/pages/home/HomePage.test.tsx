import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { EXPIRED_TOKEN } from '@/shared/bridge/mockHost'
import { renderApp } from '@/test/render'
import { server } from '@/test/server'

describe('HomePage', () => {
  it('greets the person in the app language', async () => {
    await renderApp('/', { lang: 'ky' })
    expect(await screen.findByRole('heading', { name: 'Салам, Айдана' })).toBeInTheDocument()
    expect(screen.getByText('+996 700 123 456')).toBeInTheDocument()
  })

  it('shows an error with retry when the API fails', async () => {
    let calls = 0
    server.use(http.get('/api/me', () => (++calls === 1 ? new HttpResponse(null, { status: 500 }) : HttpResponse.json({ name: 'Айдана', phone: '1' }))))
    await renderApp('/')
    await userEvent.click(await screen.findByRole('button', { name: 'Повторить' }))
    expect(await screen.findByRole('heading', { name: 'Привет, Айдана' })).toBeInTheDocument()
  })

  it('a session the app cannot refresh → the "session expired" screen with Close', async () => {
    const { mock } = await renderApp('/', { token: EXPIRED_TOKEN, refreshFails: true })
    expect(await screen.findByRole('heading', { name: 'Сессия истекла' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
    expect(mock.state.closed).toBe(true)
  })

  it('unknown address → 404 inside the service', async () => {
    await renderApp('/nope')
    expect(await screen.findByRole('heading', { name: 'Страница не найдена' })).toBeInTheDocument()
  })
})
