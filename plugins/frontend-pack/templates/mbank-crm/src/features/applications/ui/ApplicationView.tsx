import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { isApiError } from '@/shared/api/http'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { Button } from '@/shared/ui/button'
import { applicationOptions } from '../api/queries'
import { applicationMessages as m } from '../lib/messages'
import { ApplicationDetails } from './ApplicationDetails'
import { ApplicationSkeleton } from './ApplicationSkeleton'

/** Application page body: loading / not found / error / details (pages/application/UX.md). */
export function ApplicationView({ applicationId }: { applicationId: string }) {
  const query = useQuery(applicationOptions(applicationId))

  if (query.isPending) return <ApplicationSkeleton />
  if (query.isError) {
    if (isApiError(query.error) && query.error.status === 404) {
      return (
        <EmptyState
          title={m.notFound}
          description={m.notFoundDescription}
          action={
            <Button asChild variant="secondary">
              <Link to="/">{m.back}</Link>
            </Button>
          }
        />
      )
    }
    return <ErrorState title={m.errorTitle} description={m.errorDescription} retryLabel={m.retry} onRetry={() => query.refetch()} />
  }
  return <ApplicationDetails application={query.data} />
}
