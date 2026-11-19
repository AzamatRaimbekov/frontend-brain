import { useTranslation } from 'react-i18next'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'

export function OfflineBanner() {
  const { t } = useTranslation()
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div role="status" className="sticky top-0 z-40 bg-muted px-4 py-2 text-center text-sm text-foreground">
      {t('offline')}
    </div>
  )
}
