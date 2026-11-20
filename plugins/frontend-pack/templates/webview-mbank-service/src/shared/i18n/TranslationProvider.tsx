import { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'

import i18n from './i18n'
import { useMbankLang } from './libs'

const TranslationProvider = ({ children }: { children: ReactNode }) => {
  useMbankLang()

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}

TranslationProvider.displayName = 'TranslationProvider'

export default TranslationProvider
