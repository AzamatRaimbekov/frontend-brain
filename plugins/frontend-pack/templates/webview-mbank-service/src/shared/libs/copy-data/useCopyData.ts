import { useGlobalNotification } from '@shared/notification'
import { t } from 'i18next'

export const useCopyData = () => {
  const { openNotification } = useGlobalNotification()

  const copyData = async (data: string) => {
    try {
      await navigator.clipboard.writeText(data)
      openNotification({
        type: 'info',
        message: t('copy_success'),
      })
    } catch {
      openNotification({
        type: 'info',
        message: t('copy_error'),
      })
    }
  }

  return { copyData }
}
