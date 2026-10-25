import { queryOptions } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import { withDevMock } from './devMock'
import { applicationSchema, pipelineSchema, type Period } from './schemas'

export const applicationsKeys = {
  all: ['applications'] as const,
  pipeline: (period: Period) => [...applicationsKeys.all, 'pipeline', period] as const,
  detail: (id: string) => [...applicationsKeys.all, 'detail', id] as const,
}

export const applicationUrl = (id: string) => `/api/applications/${encodeURIComponent(id)}`

export function pipelineOptions(period: Period) {
  return queryOptions({
    queryKey: applicationsKeys.pipeline(period),
    queryFn: ({ signal }) =>
      http(`/api/pipeline?${withDevMock(new URLSearchParams({ period }))}`, (d) => pipelineSchema.parse(d), { signal }),
    // The board is a work queue: refresh it while the tab is open.
    refetchInterval: 60_000,
  })
}

export function applicationOptions(id: string) {
  return queryOptions({
    queryKey: applicationsKeys.detail(id),
    queryFn: ({ signal }) => http(`${applicationUrl(id)}?${withDevMock()}`, (d) => applicationSchema.parse(d), { signal }),
  })
}
