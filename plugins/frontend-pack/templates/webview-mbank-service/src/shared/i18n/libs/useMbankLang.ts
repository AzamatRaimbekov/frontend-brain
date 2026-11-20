import { TokenStorage } from '@shared/libs/storage'

import { useEffect, useState } from 'react'

import i18n from '../i18n'

const getInitialLang = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const langParam = urlParams.get('lang')
  const langFromStorage = TokenStorage.getFromStorage('lang', false)

  if (langParam && langFromStorage !== langParam) {
    TokenStorage.saveToStorage({
      saveLocal: false,
      value: langParam,
      key: 'lang',
    })
  }
  const lang = langParam || langFromStorage || 'ru'

  return lang
}

export const useMbankLang = () => {
  const [lang] = useState(getInitialLang)

  useEffect(() => {
    i18n.changeLanguage(lang)
  }, [lang])

  return { lang }
}
