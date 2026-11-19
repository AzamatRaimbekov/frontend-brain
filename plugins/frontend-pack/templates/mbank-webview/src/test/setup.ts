import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { host } from '@/shared/bridge'
import { server } from './server'

configure({ asyncUtilTimeout: 5000 })
// TanStack Router restores scroll on navigation; jsdom has no scrollTo.
window.scrollTo = () => {}

// MSW 3: the option is onUnhandledFrame; onUnhandledRequest is silently ignored.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  host.reset()
})
afterAll(() => server.close())
