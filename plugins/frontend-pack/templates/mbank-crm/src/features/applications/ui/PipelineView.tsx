import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { BoardSkeleton } from '@/shared/components/crm/BoardSkeleton'
import { PeriodSegment } from '@/shared/components/crm/PeriodSegment'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { pipelineOptions } from '../api/queries'
import type { Period, Stage } from '../api/schemas'
import { periodOptions, pipelineMessages as m } from '../lib/messages'
import { PipelineBoard } from './PipelineBoard'
import { PipelineKpis } from './PipelineKpis'

type PipelineViewProps = {
  period: Period
  onPeriodChange: (period: Period) => void
  onShowMore: (stage: Stage) => void
}

/** Period switch + KPI + board with loading / error / empty states (pages/pipeline/UX.md). */
export function PipelineView({ period, onPeriodChange, onShowMore }: PipelineViewProps) {
  // Keep the previous period on screen while the new one loads (no flash of skeletons).
  const query = useQuery({ ...pipelineOptions(period), placeholderData: keepPreviousData })
  const data = query.data
  const empty = data !== undefined && data.columns.every((column) => column.total === 0)

  return (
    <PeriodSegment
      title={data ? m.heading(data.periodLabel) : 'Конвейер'}
      value={period}
      onValueChange={onPeriodChange}
      options={periodOptions}
    >
      {query.isError && !data ? (
        <ErrorState title={m.errorTitle} description={m.errorDescription} retryLabel={m.retry} onRetry={() => query.refetch()} />
      ) : (
        <div aria-busy={query.isFetching} className="flex flex-col gap-6">
          <PipelineKpis kpis={data?.kpis} />
          {!data ? (
            <BoardSkeleton label={m.loading} />
          ) : empty ? (
            <EmptyState title={m.emptyTitle} description={m.emptyDescription} />
          ) : (
            <PipelineBoard columns={data.columns} onShowMore={onShowMore} />
          )}
        </div>
      )}
    </PeriodSegment>
  )
}
