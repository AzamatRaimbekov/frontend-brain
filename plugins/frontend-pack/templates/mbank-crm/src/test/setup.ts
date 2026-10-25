import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { resetDb } from '@/mocks/data/db'
import { server } from './server'

configure({ asyncUtilTimeout: 5000 })
// TanStack Router restores scroll on navigation; jsdom has no scrollTo.
window.scrollTo = () => {}

// MSW 3: the option is onUnhandledFrame; onUnhandledRequest is silently ignored.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetDb()
})
afterAll(() => server.close())
