import { getRouteApi } from '@tanstack/react-router'
import { ApplicationView } from '@/features/applications'

const route = getRouteApi('/applications/$applicationId')

export function ApplicationPage() {
  const { applicationId } = route.useParams()
  // key: another application starts with fresh dialog and mutation state.
  return <ApplicationView key={applicationId} applicationId={applicationId} />
}
