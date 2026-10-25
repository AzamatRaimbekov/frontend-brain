import { getRouteApi } from '@tanstack/react-router'
import { pipelineMessages as m, PipelineView } from '@/features/applications'

const route = getRouteApi('/')

export function PipelinePage() {
  const { period = 'today' } = route.useSearch()
  const navigate = route.useNavigate()
  return (
    <>
      <title>{`${m.title} — Mbank CRM`}</title>
      <PipelineView
        period={period}
        onPeriodChange={(next) => navigate({ search: { period: next === 'today' ? undefined : next }, replace: true })}
        // "Все заявки" (a placeholder route until the list page exists) filtered by stage.
        onShowMore={(stage) => navigate({ href: `/applications?stage=${stage}` })}
      />
    </>
  )
}
