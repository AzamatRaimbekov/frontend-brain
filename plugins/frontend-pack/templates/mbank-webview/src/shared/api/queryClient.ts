import { QueryClient } from '@tanstack/react-query'
import { isApiError } from './http'

// 4xx will not succeed on retry (react-error-handling §5); 401 is already handled by http() and the host.
const isRetryable = (error: unknown) => !isApiError(error) || error.status >= 500

export const queryClient = new QueryClient({
  defaultOptions: {
    // The WebView goes to the background with the app: refetch on return happens via host resume, not focus.
    queries: { staleTime: 30_000, retry: (count, error) => count < 1 && isRetryable(error), refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
})
