import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/shared/ui/skeleton'

/** While the app answers `init` (up to 3 s): the shape of a screen, no spinner in the middle. */
export function AppSkeleton() {
  const { t } = useTranslation()
  return (
    <main aria-busy="true" aria-label={t('common.loading')} className="webview-screen flex flex-col gap-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </main>
  )
}
