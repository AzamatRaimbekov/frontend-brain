import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { StatusScreen } from '@/shared/components/StatusScreen'
import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <StatusScreen
      title={t('notFound.title')}
      actions={
        <Button asChild size="lg" variant="secondary">
          <Link to="/">{t('notFound.action')}</Link>
        </Button>
      }
    />
  )
}
