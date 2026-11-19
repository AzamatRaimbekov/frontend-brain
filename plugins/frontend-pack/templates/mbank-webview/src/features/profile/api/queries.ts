import { queryOptions } from '@tanstack/react-query'
import { http } from '@/shared/api/http'
import { profileSchema } from './schemas'

export const profileKeys = { all: ['profile'] as const, me: () => [...profileKeys.all, 'me'] as const }

export const profileQueries = {
  me: () =>
    queryOptions({
      queryKey: profileKeys.me(),
      queryFn: ({ signal }) => http('/api/me', (data) => profileSchema.parse(data), { signal }),
    }),
}
