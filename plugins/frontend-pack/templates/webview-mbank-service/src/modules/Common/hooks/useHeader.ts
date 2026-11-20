import { useAppNavigate } from '@shared/hooks/useAppNavigate'
import {
  getMobileBridgeErrorMessage,
  isMobileBridgeInvokeError,
} from '@shared/mobile-bridge/mobileBridge'
import { useGlobalNotification } from '@shared/notification'

import { useCallback } from 'react'
import { useLocation, useMatches } from 'react-router-dom'

import {
  getLastMatchWithDynamicTitle,
  getLastMatchWithIsExit,
  getLastMatchWithSubTitle,
  getLastMatchWithTitle,
  resolveBackUrl,
} from '../lib/headerHelpers'
import { type HeaderMatch } from '../model'
import { commonApi } from '../model/api'

export const useHeader = () => {
  const { openNotification } = useGlobalNotification()
  const navigate = useAppNavigate()
  const matches = useMatches() as HeaderMatch[]
  const { state } = useLocation()

  const title = getLastMatchWithTitle(matches)?.handle?.title
  const isSubtitle = getLastMatchWithSubTitle(matches)?.handle?.subtitle
  const isExit = getLastMatchWithIsExit(matches)?.handle?.isExit
  const backUrl = resolveBackUrl(matches)

  const dynamicTitle =
    getLastMatchWithDynamicTitle(matches)?.handle?.dynamicTitle
  const dynamicTitleState = state?.name
  const handleBack = useCallback(() => {
    if (isExit) {
      commonApi.closeApp().catch((error) => {
        openNotification({
          type: 'info',
          message: isMobileBridgeInvokeError(error)
            ? getMobileBridgeErrorMessage(error.code)
            : 'Не удалось закрыть сервис. Попробуйте еще раз.',
        })
      })
      return
    } else if (backUrl) {
      navigate(backUrl, { replace: true })
    } else {
      navigate(-1)
    }
  }, [isExit, backUrl, openNotification, navigate])

  return {
    title,
    handleBack,
    backUrl,
    isSubtitle,
    subtitle: state?.subtitle,
    dynamicTitle,
    dynamicTitleState,
  }
}
