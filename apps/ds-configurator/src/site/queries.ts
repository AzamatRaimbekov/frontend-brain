// TanStack Query hooks for the site: project list, project detail, history and the writes.
// A token write sends the version it was made from; a 409 refetches the project (someone else won).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api, ApiError, projectKeys, type ProjectDetail, type TokensInput } from "./api"
import { saveWriteKey } from "./write-keys"

export const useProjects = () => useQuery({ queryKey: projectKeys.list(), queryFn: api.projects })

export const useProject = (id: string) => useQuery({ queryKey: projectKeys.detail(id), queryFn: () => api.project(id) })

export const useHistory = (id: string) => useQuery({ queryKey: projectKeys.history(id), queryFn: () => api.history(id) })

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.create,
    onSuccess: (r) => {
      saveWriteKey(r.project.id, r.writeKey)
      return qc.invalidateQueries({ queryKey: projectKeys.list() })
    },
  })
}

/** Current editable document of a loaded project. */
export const inputOf = (d: ProjectDetail): TokensInput => ({
  brand: d.tokens.brand, prefix: d.tokens.prefix, overrides: d.tokens.overrides, custom: d.tokens.custom,
})

export function useSaveTokens(id: string, key: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ version, tokens }: { version: number; tokens: TokensInput }) => {
      if (!key) throw new ApiError(401, "Нет ключа записи проекта: вставьте его во вкладке Figma")
      return api.putTokens(id, key, version, tokens)
    },
    onSettled: () => Promise.all([
      qc.invalidateQueries({ queryKey: projectKeys.detail(id) }),
      qc.invalidateQueries({ queryKey: projectKeys.history(id) }),
      qc.invalidateQueries({ queryKey: projectKeys.list() }),
    ]),
  })
}

export function useLinkFigma(id: string, key: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (link: { fileKey: string; fileName?: string }) => {
      if (!key) throw new ApiError(401, "Нет ключа записи проекта")
      return api.linkFigma(id, key, link)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: projectKeys.detail(id) }),
  })
}

export function useRotateKey(id: string, key: string | null) {
  return useMutation({
    mutationFn: () => {
      if (!key) throw new ApiError(401, "Нет ключа записи проекта")
      return api.rotateKey(id, key)
    },
    onSuccess: (r) => saveWriteKey(id, r.writeKey),
  })
}
