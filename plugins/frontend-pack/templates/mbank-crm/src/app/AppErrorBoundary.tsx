import type { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { AppFallback } from './AppFallback'

/** Outermost boundary: catches a crash in providers or the router itself. */
export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary FallbackComponent={AppFallback}>{children}</ErrorBoundary>
}
