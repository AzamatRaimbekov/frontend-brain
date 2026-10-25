import { QueryClient } from '@tanstack/react-query'
import { isApiError } from './http'

// 4xx will not succeed on retry (react-error-handling §5): show the result (e.g. "not found") at once.
const isRetryable = (error: unknown) => !isApiError(error) || error.status >= 500

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: (count, error) => count < 1 && isRetryable(error), refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
})
