import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ProfileCard, profileQueries } from '@/features/profile'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

export function HomePage() {
  const { t } = useTranslation()
  const profile = useQuery(profileQueries.me())

  return (
    <main className="webview-screen flex flex-col gap-4">
      <title>{t('home.title')}</title>
      {profile.isPending ? (
        <div aria-busy="true" aria-label={t('common.loading')} className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : profile.isError ? (
        <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-muted-foreground">{t('home.error')}</p>
          <Button variant="secondary" loading={profile.isFetching} onClick={() => void profile.refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-foreground">{t('home.greeting', { name: profile.data.name })}</h1>
          <ProfileCard profile={profile.data} />
        </>
      )}
    </main>
  )
}
