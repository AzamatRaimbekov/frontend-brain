import { useTranslation } from 'react-i18next'

import { ImageWithPreview } from '../ImageWithPreview'

export const AppLoader = () => {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-lvh w-full flex-col items-center justify-center gap-12 p-4">
      <div className="flex flex-col items-center justify-center gap-6 rounded-2xl bg-card p-6">
        <div className="flex items-center gap-6">
          <ImageWithPreview
            src={'/logos/entry-ban-logo.png'}
            className="h-[52px] w-[52px]"
          />
          <span className="text-xl text-muted-foreground">+</span>
          <ImageWithPreview
            src={'/logos/mbank-logo.png'}
            className="h-[52px] w-[52px]"
          />
        </div>
        <div className="text-center">
          <div className="text-base font-medium text-muted-foreground">
            {t('developedTogether')}
          </div>
          <div className="font-bold text-foreground">
            {t('developedTogetherDescription')}
          </div>
        </div>
      </div>
    </div>
  )
}
