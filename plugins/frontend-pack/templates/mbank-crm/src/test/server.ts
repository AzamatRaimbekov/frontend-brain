import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'

// The same handlers as in dev (src/mocks), so tests run the real fetchers, schemas and cache.
export const server = setupServer(...handlers)
