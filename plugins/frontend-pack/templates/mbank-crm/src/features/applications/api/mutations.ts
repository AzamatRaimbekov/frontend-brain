import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import { withDevMock } from './devMock'
import { applicationsKeys, applicationUrl } from './queries'
import { applicationSchema, type Application, type Decision } from './schemas'

const post = (url: string, body?: unknown) =>
  http(`${url}?${withDevMock()}`, (d) => applicationSchema.parse(d), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

/** Server response replaces the cached application; the board is refetched (no optimistic update). */
function useApplicationMutation<T>(id: string, request: (variables: T) => Promise<Application>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: request,
    onSuccess: (application) => {
      queryClient.setQueryData(applicationsKeys.detail(id), application)
      return queryClient.invalidateQueries({ queryKey: [...applicationsKeys.all, 'pipeline'] })
    },
  })
}

export const useDecision = (id: string) =>
  useApplicationMutation(id, (decision: Decision) => post(`${applicationUrl(id)}/decision`, { decision }))

export const useRequestDocuments = (id: string) =>
  useApplicationMutation(id, () => post(`${applicationUrl(id)}/documents-request`))
