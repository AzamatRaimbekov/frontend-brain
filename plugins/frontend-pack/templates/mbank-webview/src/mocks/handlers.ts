import { http, HttpResponse } from 'msw'
import { EXPIRED_TOKEN, MOCK_TOKEN_PREFIX } from '@/shared/bridge/mockHost'

// Dev and test API. The token check mirrors the real backend: no or expired token → 401.
// In the browser ?mock=error answers 500 to see the error state.
const authorized = (request: Request) => {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? ''
  return token.startsWith(MOCK_TOKEN_PREFIX) && token !== EXPIRED_TOKEN
}
const scenario = () => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('mock'))

export const handlers = [
  http.get('/api/me', ({ request }) => {
    if (!authorized(request)) return new HttpResponse(null, { status: 401 })
    if (scenario() === 'error') return new HttpResponse(null, { status: 500 })
    return HttpResponse.json({ name: 'Айдана', phone: '+996 700 123 456' })
  }),
]
