import { TokenStorage } from '@shared/libs/storage'

import { useState } from 'react'

const getInitialToken = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const tokenParam = urlParams.get('token')
  const isCustomToken = urlParams.get('customToken')
  const tokenFromStorage = TokenStorage.getFromStorage()

  if (isCustomToken) {
    TokenStorage.saveToStorage({
      saveLocal: false,
      value: isCustomToken,
      key: 'customToken',
    })
  }

  if (tokenParam && tokenFromStorage !== tokenParam) {
    TokenStorage.saveToStorage({
      saveLocal: false,
      value: tokenParam,
    })
  }

  return tokenParam || tokenFromStorage
}

export const useMbankToken = () => {
  const [token] = useState(getInitialToken)

  return { token }
}
