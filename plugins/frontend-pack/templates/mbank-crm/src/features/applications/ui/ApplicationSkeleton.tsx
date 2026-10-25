import { Skeleton } from '@/shared/ui/skeleton'
import { applicationMessages as m } from '../lib/messages'

/** Same geometry as the loaded page: summary 144, stages 80, two columns of cards. */
export function ApplicationSkeleton() {
  return (
    <div role="status" aria-label={m.loading} className="flex flex-col gap-4">
      <Skeleton className="h-36 rounded-lg bg-surface-0" />
      <Skeleton className="h-20 rounded-lg bg-surface-0" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-54 rounded-lg bg-surface-0" />
          <Skeleton className="h-54 rounded-lg bg-surface-0" />
        </div>
        <Skeleton className="h-58 rounded-lg bg-surface-0" />
      </div>
    </div>
  )
}
