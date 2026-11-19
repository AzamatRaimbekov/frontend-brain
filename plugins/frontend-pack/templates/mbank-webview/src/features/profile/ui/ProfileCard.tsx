import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/shared/ui/card'
import type { Profile } from '../api/schemas'

export function ProfileCard({ profile }: { profile: Profile }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent className="grid gap-1">
        <p className="text-sm text-muted-foreground">{t('home.phone')}</p>
        <p className="text-base font-medium tabular-nums">{profile.phone}</p>
      </CardContent>
    </Card>
  )
}
