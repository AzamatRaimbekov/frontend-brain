import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { host, useHost } from '@/shared/bridge'
import { StatusScreen } from '@/shared/components/StatusScreen'
import { Button } from '@/shared/ui/button'
import { AppSkeleton } from './AppSkeleton'

/** Nothing of the service renders without a session from the app: each other state has its own screen. */
export function HostGate({ children }: { children: ReactNode }) {
  const { status, theme } = useHost()
  const { t } = useTranslation()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (status === 'ready') return children
  if (status === 'connecting') return <AppSkeleton />

  const close = host.canClose() ? (
    <Button size="lg" variant={status === 'expired' ? 'primary' : 'secondary'} onClick={host.close}>
      {t('common.close')}
    </Button>
  ) : null

  if (status === 'standalone') return <StatusScreen title={t('host.standalone.title')} text={t('host.standalone.text')} />
  if (status === 'failed') {
    return (
      <StatusScreen
        role="alert"
        title={t('host.failed.title')}
        text={t('host.failed.text')}
        actions={
          <>
            <Button size="lg" onClick={() => void host.retry()}>{t('common.retry')}</Button>
            {close}
          </>
        }
      />
    )
  }
  return <StatusScreen role="alert" title={t('host.expired.title')} text={t('host.expired.text')} actions={close} />
}
